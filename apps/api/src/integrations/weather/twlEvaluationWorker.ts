/**
 * AD6.Ai Smart HSE Platform — TWL Evaluation Worker & Permit Safety Gate (PDO SP-1170)
 *
 * Evaluates live or scheduled weather readings against PDO SP-1170 thermal criteria:
 * - Persists readings into `twl_readings`
 * - Evaluates the 115 W/m² stop threshold
 * - Automatically logs `twl_breaches` with `stop_work_triggered = true`
 * - Gating logic: Blocks permit activation / work authorization in breach zones
 */

import crypto from 'node:crypto';
import { getPool, withTenantContext } from '../../db/connection.js';
import { WeatherProvider, calculateTwlPdoSp1170, TwlAssessment } from './weatherAdapter.js';
import { writeAudit } from '../../audit/writeAudit.js';

export interface TwlEvaluationResult {
  readingId: string;
  twlValue: number;
  flagColor: string;
  stopWorkTriggered: boolean;
  breachId?: string;
  activePermitsAffected: number;
  assessment: TwlAssessment;
}

export class TwlEvaluationWorker {
  /**
   * Evaluates weather and computes TWL for a specific site, persisting readings and breaches.
   */
  public static async evaluateSite(
    tenantId: string,
    siteId: string,
    location: string,
    provider: WeatherProvider,
    actorId = 'system_twl_worker'
  ): Promise<TwlEvaluationResult> {
    const reading = await provider.fetchWeather(siteId, location);
    const assessment = calculateTwlPdoSp1170(
      reading.dryBulbC,
      reading.relativeHumidityPct,
      reading.windSpeedMps,
      reading.globeTempC
    );

    const readingId = crypto.randomUUID();
    let breachId: string | undefined = undefined;
    let activePermitsAffected = 0;

    await withTenantContext(tenantId, async (client) => {
      // 1. Store twl_reading
      await client.query(
        `INSERT INTO twl_readings (
          id, tenant_id, site_id, location, dry_bulb_c, wet_bulb_c, globe_temp_c,
          twl_w_m2, work_rest_regime, flag_color, recorded_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          readingId,
          tenantId,
          siteId.startsWith('00000000') ? siteId : null,
          location,
          reading.dryBulbC,
          reading.wetBulbC,
          reading.globeTempC,
          assessment.twlWattsPerSqM,
          assessment.workRestRegime,
          assessment.flagColor
        ]
      );

      // 2. If TWL < 115 W/m²: Trigger Stop Work breach per PDO SP-1170
      if (assessment.stopWorkTriggered) {
        breachId = crypto.randomUUID();
        await client.query(
          `INSERT INTO twl_breaches (
            id, tenant_id, site_id, reading_id, twl_value, breach_type, stop_work_triggered, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW())`,
          [
            breachId,
            tenantId,
            siteId.startsWith('00000000') ? siteId : null,
            readingId,
            assessment.twlWattsPerSqM,
            'CRITICAL_THERMAL_STOP_WORK_PDO_SP1170'
          ]
        );

        // Audit log entry
        await writeAudit({
          tenantId,
          actorId,
          actorRole: 'System_IoT_Worker',
          action: 'TWL_STOP_WORK_BREACH_RECORDED',
          entityType: 'TWL_BREACH',
          entityId: breachId,
          afterState: {
            twlWattsPerSqM: assessment.twlWattsPerSqM,
            threshold: 115.0,
            location,
            flagColor: assessment.flagColor
          },
          metadata: {
            stationId: reading.stationId,
            provider: provider.providerName
          }
        });

        // 3. Count active permits gated by this breach
        const permitRes = await client.query<{ count: string }>(
          `SELECT COUNT(*) as count FROM permits 
           WHERE tenant_id = $1 AND (exact_location = $2 OR zone = $2) AND status = 'Active'`,
          [tenantId, location]
        );
        activePermitsAffected = parseInt(permitRes.rows[0]?.count || '0', 10);
      }
    });

    return {
      readingId,
      twlValue: assessment.twlWattsPerSqM,
      flagColor: assessment.flagColor,
      stopWorkTriggered: assessment.stopWorkTriggered,
      breachId,
      activePermitsAffected,
      assessment
    };
  }

  /**
   * Safety Gate: Evaluates whether a permit may be activated or issued at a site.
   * Fails closed if an active, unresolved TWL breach exists (< 115 W/m²).
   */
  public static async checkPermitThermalGate(
    tenantId: string,
    location: string
  ): Promise<{ allowed: boolean; reason?: string; twlValue?: number }> {
    const pool = getPool();

    // Find any unresolved breaches recorded in the last 2 hours
    const breachRes = await pool.query<{ twl_value: string; created_at: string }>(
      `SELECT b.twl_value, b.created_at 
       FROM twl_breaches b
       JOIN twl_readings r ON b.reading_id = r.id
       WHERE b.tenant_id = $1 
         AND r.location = $2 
         AND b.resolved_at IS NULL
         AND b.created_at >= NOW() - INTERVAL '2 hours'
       ORDER BY b.created_at DESC
       LIMIT 1`,
      [tenantId, location]
    );

    if (breachRes.rows.length > 0) {
      const breach = breachRes.rows[0];
      const twl = parseFloat(breach.twl_value);
      return {
        allowed: false,
        twlValue: twl,
        reason: `Permit Activation Gated: Active Thermal Stop-Work breach (${twl} W/m² < 115 W/m² threshold per PDO SP-1170) at "${location}". Outdoor work suspended.`
      };
    }

    return { allowed: true };
  }
}
