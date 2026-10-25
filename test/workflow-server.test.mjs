import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { io as socketClient } from 'socket.io-client';
import { createWorkflowRouter } from '../routes/workflowRouter.ts';

test('guarded workflow API and Socket.IO deliver an incident approval chain across demo users', async () => {
  const previousWorkflowFlag = process.env.WORKFLOW_LINKING;
  const previousDemoFlag = process.env.DEMO_MODE;
  process.env.WORKFLOW_LINKING = 'true';
  process.env.DEMO_MODE = 'true';

  const app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  const io = new SocketServer(httpServer, { cors: { origin: '*' } });
  app.use('/api/workflow', createWorkflowRouter(io.of('/workflow')));
  const sockets = [];

  try {
    await new Promise(resolve => httpServer.listen(0, '127.0.0.1', resolve));
    const address = httpServer.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    process.env.WORKFLOW_LINKING = 'false';
    const disabledStatus = await fetch(`${baseUrl}/api/workflow/status`).then(response => response.json());
    assert.deepEqual(disabledStatus, { enabled: false, demoOnly: true });
    const disabledSession = await fetch(`${baseUrl}/api/workflow/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'worker', role: 'Worker', department: 'Operations' })
    });
    assert.equal(disabledSession.status, 404);

    process.env.WORKFLOW_LINKING = 'true';
    const status = await fetch(`${baseUrl}/api/workflow/status`).then(response => response.json());
    assert.deepEqual(status, { enabled: true, demoOnly: true });
    const unauthenticated = await fetch(`${baseUrl}/api/workflow/state`);
    assert.equal(unauthenticated.status, 401);

    const session = async userId => {
      const response = await fetch(`${baseUrl}/api/workflow/session`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      assert.equal(response.status, 200);
      return response.json().then(data => data.token);
    };
    const forgedRole = await fetch(`${baseUrl}/api/workflow/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'usr-workflow-worker-oman', role: 'CEO' })
    });
    assert.equal(forgedRole.status, 400);
    const unknownDemoUser = await fetch(`${baseUrl}/api/workflow/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'someone-else' })
    });
    assert.equal(unknownDemoUser.status, 403);

    const reporterToken = await session('usr-workflow-worker-oman');
    const officerToken = await session('usr-workflow-hse-officer-oman');
    const managerToken = await session('usr-workflow-hse-manager-oman');
    const ceoToken = await session('usr-workflow-ceo-oman');

    const connect = token => new Promise((resolve, reject) => {
      const socket = socketClient(`${baseUrl}/workflow`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: false
      });
      sockets.push(socket);
      socket.once('connect', () => resolve(socket));
      socket.once('connect_error', reject);
    });
    const [officerSocket, ceoSocket] = await Promise.all([connect(officerToken), connect(ceoToken)]);

    const invalidPayload = await fetch(`${baseUrl}/api/workflow/records`, {
      method: 'POST',
      headers: { authorization: `Bearer ${reporterToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({ recordType: 'Unknown', recordId: 'X', title: 'Bad data' })
    });
    assert.equal(invalidPayload.status, 400);

    const officerNotification = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('HSE Officer did not receive the incident event.')), 1500);
      officerSocket.on('workflow:event', event => {
        if (event.type === 'incident.reported') {
          clearTimeout(timeout);
          resolve(event);
        }
      });
    });

    const createdResponse = await fetch(`${baseUrl}/api/workflow/records`, {
      method: 'POST',
      headers: { authorization: `Bearer ${reporterToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        recordType: 'Incident',
        recordId: 'INC-DEMO-1',
        title: 'Synthetic high-potential process incident',
        priority: 'Critical',
        highPotential: true,
        serious: true
      })
    });
    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json();
    const investigation = created.workItems.find(item => item.recordType === 'Investigation');
    assert.ok(investigation);
    const initialNotification = await officerNotification;
    assert.equal(initialNotification.recordRef.recordId, 'INC-DEMO-1');

    const act = async (token, itemId, action) => {
      const response = await fetch(`${baseUrl}/api/workflow/items/${itemId}/actions`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify(action)
      });
      assert.equal(response.status, 200);
      return response.json();
    };
    await act(officerToken, investigation.id, { type: 'claim' });
    await act(officerToken, investigation.id, { type: 'complete' });

    const ceoNotification = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('CEO did not receive the post-approval event.')), 1500);
      ceoSocket.on('workflow:event', event => {
        if (event.type === 'approval.granted') {
          clearTimeout(timeout);
          resolve(event);
        }
      });
    });
    const approved = await act(managerToken, investigation.id, { type: 'approve' });
    assert.equal(approved.workItems.find(item => item.id === investigation.id).status, 'Done');
    const approvalEvent = await ceoNotification;
    assert.ok(approvalEvent.targetRoles.includes('CEO'));

    const state = await fetch(`${baseUrl}/api/workflow/state`, {
      headers: { authorization: `Bearer ${reporterToken}` }
    }).then(response => response.json());
    assert.ok(state.events.some(event => event.type === 'incident.reported'));
  } finally {
    sockets.forEach(socket => socket.disconnect());
    await new Promise(resolve => io.close(resolve));
    if (previousWorkflowFlag === undefined) delete process.env.WORKFLOW_LINKING;
    else process.env.WORKFLOW_LINKING = previousWorkflowFlag;
    if (previousDemoFlag === undefined) delete process.env.DEMO_MODE;
    else process.env.DEMO_MODE = previousDemoFlag;
  }
});
