/**
 * Document Repository Interface and PostgreSQL Implementation
 */

import { withTenantContext } from '../db/connection';
import { DocumentRecord } from '../db/schema';
import { ensureUuid } from '../utils/uuid';

export interface IDocumentRepository {
  findMany(tenantId: string, options?: { limit?: number; offset?: number; category?: string; status?: string }): Promise<{ items: DocumentRecord[]; total: number }>;
  findById(tenantId: string, id: string): Promise<DocumentRecord | null>;
  create(tenantId: string, data: Omit<DocumentRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<DocumentRecord>;
  update(tenantId: string, id: string, data: Partial<Omit<DocumentRecord, 'id' | 'tenant_id' | 'created_at'>>): Promise<DocumentRecord | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
}

export class PostgresDocumentRepository implements IDocumentRepository {
  public async findMany(
    tenantId: string,
    options: { limit?: number; offset?: number; category?: string; status?: string } = {}
  ): Promise<{ items: DocumentRecord[]; total: number }> {
    return withTenantContext(tenantId, async (client) => {
      const limit = options.limit ?? 50;
      const offset = options.offset ?? 0;

      let whereClause = 'WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (options.category) {
        whereClause += ` AND category = $${paramIndex++}`;
        params.push(options.category);
      }
      if (options.status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(options.status);
      }

      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM documents ${whereClause}`, params);
      const total = Number(countRes.rows[0]?.count || 0);

      const query = `
        SELECT * FROM documents 
        ${whereClause} 
        ORDER BY doc_number ASC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const res = await client.query<DocumentRecord>(query, params);
      return { items: res.rows, total };
    });
  }

  public async findById(tenantId: string, id: string): Promise<DocumentRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query<DocumentRecord>(
        'SELECT * FROM documents WHERE (id::text = $1 OR doc_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rows[0] || null;
    });
  }

  public async create(
    tenantId: string,
    data: Omit<DocumentRecord, 'id' | 'tenant_id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<DocumentRecord> {
    return withTenantContext(tenantId, async (client) => {
      const id = ensureUuid(data.id);
      const doc_number = data.doc_number || data.id || `DOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const query = `
        INSERT INTO documents (
          id, tenant_id, doc_number, title, category, status,
          current_version, owner_name, file_url, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        ) RETURNING *
      `;
      const params = [
        id,
        tenantId,
        doc_number,
        data.title,
        data.category,
        data.status || 'Active',
        data.current_version || '1.0',
        data.owner_name,
        data.file_url
      ];
      const res = await client.query<DocumentRecord>(query, params);
      return res.rows[0];
    });
  }

  public async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<DocumentRecord, 'id' | 'tenant_id' | 'created_at'>>
  ): Promise<DocumentRecord | null> {
    return withTenantContext(tenantId, async (client) => {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const merged = { ...existing, ...data };
      const query = `
        UPDATE documents SET
          doc_number = $1, title = $2, category = $3, status = $4,
          current_version = $5, owner_name = $6, file_url = $7, updated_at = NOW()
        WHERE id::text = $8 AND tenant_id = $9
        RETURNING *
      `;
      const params = [
        merged.doc_number,
        merged.title,
        merged.category,
        merged.status,
        merged.current_version,
        merged.owner_name,
        merged.file_url,
        existing.id,
        tenantId
      ];
      const res = await client.query<DocumentRecord>(query, params);
      return res.rows[0] || null;
    });
  }

  public async delete(tenantId: string, id: string): Promise<boolean> {
    return withTenantContext(tenantId, async (client) => {
      const res = await client.query(
        'DELETE FROM documents WHERE (id::text = $1 OR doc_number = $1) AND tenant_id = $2',
        [id, tenantId]
      );
      return res.rowCount > 0;
    });
  }
}

export const documentRepository = new PostgresDocumentRepository();
