/**
 * Training & Competency Repository Interface and PostgreSQL Implementation
 * Integrated with append-only hash-chained audit trail.
 */

import { withTenantContext } from '../db/connection';
import { TrainingRecordEntity } from '../db/schema';
import { ensureUuid } from '../utils/uuid';
import { writeAudit } from '../audit/writeAudit';

export interface ITrainingRepository {
  findMany(tenantId: string, options?: { limit?: number; offset?: number; civil_id?: string; course_code?: string; trainee_name?: string }): Promise<{ items: TrainingRecordEntity[]; total: number }>;
  findById(tenantId: string, id: string): Promise<TrainingRecordEntity | null>;
  create(tenantId: string, data: Omit<TrainingRecordEntity, 'id' | 'tenant_id' | 'created_at'> & { id?: string }, actorId?: string): Promise<TrainingRecordEntity>;
  update(tenantId: string, id: string, data: Partial<Omit<TrainingRecordEntity, 'id' | 'tenant_id' | 'created_at'>>, actorId?: string): Promise<TrainingRecordEntity | null>;
  delete(tenantId: string, id: string, actorId?: string): Promise<boolean>;
}

export class PostgresTrainingRepository implements ITrainingRepository {
  public async findMany(
    tenantId: string,
    options: { limit?: number; offset?: number; civil_id?: string; course_code?: string; trainee_name?: string } = {}
  ): Promise<{ items: TrainingRecordEntity[]; total: number }> {
    return withTenantContext(tenantId, async (client) => {
      const limit = options.limit ?? 50;
      const offset = options.offset ?? 0;

      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (options.civil_id) {
        whereClause += ` AND civil_id = $${paramIndex++}`;
        params.push(options.civil_id);
      }
      if (options.course_code) {
        whereClause += ` AND course_code = $${paramIndex++}`;
        params.push(options.course_code);
      }
      if (options.trainee_name) {
        whereClause += ` AND trainee_name ILIKE $${paramIndex++}`;
        params.push(`%${options.trainee_name}%`);
      }

      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM training_records ${whereClause}`, params);
      const total = Number(countRes.rows[0]?.count || 0);

      const query = `
        SELECT * FROM training_records 
        ${whereClause} 
        ORDER BY completion_date DESC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const res = await client.query<TrainingRecordEntity>(query, params);
      return { items: res.rows, total };
    });
  }

  public async findById(tenantId: string, id: string): Promise<TrainingRecordEntity | null> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<TrainingRecordEntity>(
        'SELECT * FROM training_records WHERE id::text = $1 AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rows[0] || null;
    });
  }

  public async create(
    tenantId: string,
    data: Omit<TrainingRecordEntity, 'id' | 'tenant_id' | 'created_at'> & { id?: string },
    actorId?: string
  ): Promise<TrainingRecordEntity> {
    return withTenantContext(tenantId, async (client) => {
      const id = ensureUuid(data.id);
      const query = `
        INSERT INTO training_records (
          id, tenant_id, course_title, course_code, trainee_name,
          civil_id, completion_date, expiry_date, score, certificate_url, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
        ) RETURNING *
      `;
      const params = [
        id,
        tenantId,
        data.course_title,
        data.course_code,
        data.trainee_name,
        data.civil_id,
        data.completion_date,
        data.expiry_date || null,
        data.score ?? null,
        data.certificate_url || null
      ];
      const res = await client.query<TrainingRecordEntity>(query, params);
      const created = res.rows[0];

      await writeAudit({
        tenantId,
        actorId: actorId || 'system',
        action: 'TRAINING_CREATED',
        entityType: 'TRAINING_RECORD',
        entityId: created.id,
        afterState: created,
        metadata: { course_title: created.course_title, trainee_name: created.trainee_name }
      });

      return created;
    });
  }

  public async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<TrainingRecordEntity, 'id' | 'tenant_id' | 'created_at'>>,
    actorId?: string
  ): Promise<TrainingRecordEntity | null> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const merged = { ...existing, ...data };
      const query = `
        UPDATE training_records SET
          course_title = $1, course_code = $2, trainee_name = $3, civil_id = $4,
          completion_date = $5, expiry_date = $6, score = $7, certificate_url = $8
        WHERE id::text = $9 AND tenant_id = $10
        RETURNING *
      `;
      const params = [
        merged.course_title,
        merged.course_code,
        merged.trainee_name,
        merged.civil_id,
        merged.completion_date,
        merged.expiry_date || null,
        merged.score ?? null,
        merged.certificate_url || null,
        existing.id,
        tenantId
      ];
      const res = await client.query<TrainingRecordEntity>(query, params);
      const updated = res.rows[0] || null;

      if (updated) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'TRAINING_UPDATED',
          entityType: 'TRAINING_RECORD',
          entityId: updated.id,
          beforeState: existing,
          afterState: updated,
          metadata: { course_title: updated.course_title, civil_id: updated.civil_id }
        });
      }

      return updated;
    });
  }

  public async delete(tenantId: string, id: string, actorId?: string): Promise<boolean> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return false;

      const res = await client.query('DELETE FROM training_records WHERE id::text = $1 AND tenant_id = $2', [id, tenantId]);
      const deleted = res.rowCount > 0;

      if (deleted) {
        await writeAudit({
          tenantId,
          actorId: actorId || 'system',
          action: 'TRAINING_DELETED',
          entityType: 'TRAINING_RECORD',
          entityId: existing.id,
          beforeState: existing,
          metadata: { course_title: existing.course_title }
        });
      }

      return deleted;
    });
  }
}

export const trainingRepository = new PostgresTrainingRepository();
