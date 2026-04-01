/**
 * @contract FR-011, UX-008, FR-008-M01
 *
 * Use Case: Get call log metrics for the monitoring dashboard.
 * - Total calls, success rate, DLQ count for a given period
 */

import type { CallLogRepository } from '../ports/repositories.js';

export interface GetCallLogMetricsInput {
  readonly tenantId: string;
  readonly periodStart: Date;
  readonly periodEnd: Date;
}

export interface CallLogMetricsOutput {
  readonly total: number;
  readonly success: number;
  readonly failed: number;
  readonly dlq: number;
  readonly running: number;
  readonly queued: number;
  readonly successRate: number;
  /** Average latency in ms over the period, rounded integer (FR-008-M01) */
  readonly avgLatencyMs: number;
}

export class GetCallLogMetricsUseCase {
  constructor(private readonly callLogRepo: CallLogRepository) {}

  async execute(input: GetCallLogMetricsInput): Promise<CallLogMetricsOutput> {
    const [counts, avgDuration] = await Promise.all([
      this.callLogRepo.countByStatus(input.tenantId, input.periodStart, input.periodEnd),
      this.callLogRepo.avgDurationMs(input.tenantId, input.periodStart, input.periodEnd),
    ]);

    const success = counts['SUCCESS'] ?? 0;
    const failed = counts['FAILED'] ?? 0;
    const dlq = counts['DLQ'] ?? 0;
    const running = counts['RUNNING'] ?? 0;
    const queued = counts['QUEUED'] ?? 0;
    const reprocessed = counts['REPROCESSED'] ?? 0;
    const total = success + failed + dlq + running + queued + reprocessed;

    return {
      total,
      success,
      failed,
      dlq,
      running,
      queued,
      successRate: total > 0 ? Math.round((success / total) * 1000) / 10 : 0,
      avgLatencyMs: avgDuration !== null ? Math.round(avgDuration) : 0,
    };
  }
}
