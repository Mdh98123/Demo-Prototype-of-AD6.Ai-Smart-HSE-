import { io } from 'socket.io-client';

// Connect automatically to the same host that serves the site
export const socket = io();
