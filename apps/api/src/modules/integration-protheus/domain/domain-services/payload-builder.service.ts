/**
 * @contract BR-004, BR-005, DATA-008 §2.3, DATA-008 §2.4
 *
 * Domain service for building the HTTP request payload from field mappings
 * and parameters. Enforces required field validation (BR-004)
 * and sensitive data masking for logs (BR-005).
 */

import { RequiredFieldMissingError } from '../errors/integration-errors.js';
import type { MappingType } from '../value-objects/mapping-type.js';

export interface FieldMappingInput {
  sourceField: string;
  targetField: string;
  mappingType: MappingType;
  required: boolean;
  transformExpr: string | null;
  conditionExpr: string | null;
  defaultValue: string | null;
  ordem: number;
}

export interface ParamInput {
  paramKey: string;
  paramType: string;
  value: string | null;
  derivationExpr: string | null;
  isSensitive: boolean;
}

export interface PayloadBuildResult {
  body: Record<string, unknown>;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
}

export interface SanitizedPayload {
  body: Record<string, unknown>;
  headers: Record<string, string>;
}

const SENSITIVE_HEADER_KEYS = ['authorization', 'x-api-key', 'api-key'];

/**
 * Build the outgoing HTTP payload from field mappings and context data.
 * BR-004: Aborts if a required source field is missing.
 */
export function buildPayload(
  mappings: FieldMappingInput[],
  context: Record<string, unknown>,
): PayloadBuildResult {
  const body: Record<string, unknown> = {};
  const headers: Record<string, string> = {};
  const queryParams: Record<string, string> = {};

  const sorted = [...mappings].sort((a, b) => a.ordem - b.ordem);

  for (const mapping of sorted) {
    const rawValue = resolveValue(mapping, context);

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      if (mapping.required) {
        throw new RequiredFieldMissingError(mapping.sourceField);
      }
      continue;
    }

    const value =
      mapping.transformExpr !== null ? applyTransform(rawValue, mapping.transformExpr) : rawValue;

    switch (mapping.mappingType) {
      case 'FIELD':
      case 'FIXED_VALUE':
      case 'DERIVED':
        body[mapping.targetField] = value;
        break;
      case 'HEADER':
        headers[mapping.targetField] = String(value);
        break;
      case 'PARAM':
        queryParams[mapping.targetField] = String(value);
        break;
    }
  }

  return { body, headers, queryParams };
}

/**
 * Resolve headers from integration params.
 */
export function resolveParamHeaders(
  params: ParamInput[],
  context: Record<string, unknown>,
): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const param of params) {
    if (param.paramType === 'HEADER') {
      const value = param.value ?? resolveDerivation(param, context);
      if (value !== null && value !== undefined) {
        headers[param.paramKey] = String(value);
      }
    }
  }

  return headers;
}

/**
 * BR-005: Sanitize payload and headers for logging.
 * Sensitive params are masked as "***". Auth headers are always masked.
 */
export function sanitizeForLog(
  payload: PayloadBuildResult,
  params: ParamInput[],
): SanitizedPayload {
  const sensitiveKeys = new Set(
    params.filter((p) => p.isSensitive).map((p) => p.paramKey.toLowerCase()),
  );

  const sanitizedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload.headers)) {
    const isBuiltinSensitive = SENSITIVE_HEADER_KEYS.includes(key.toLowerCase());
    const isParamSensitive = sensitiveKeys.has(key.toLowerCase());
    sanitizedHeaders[key] = isBuiltinSensitive || isParamSensitive ? '***' : value;
  }

  const sanitizedBody: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload.body)) {
    sanitizedBody[key] = sensitiveKeys.has(key.toLowerCase()) ? '***' : value;
  }

  return { body: sanitizedBody, headers: sanitizedHeaders };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolveValue(mapping: FieldMappingInput, context: Record<string, unknown>): unknown {
  if (mapping.mappingType === 'FIXED_VALUE') {
    return mapping.defaultValue;
  }

  const contextValue = getNestedValue(context, mapping.sourceField);
  if ((contextValue === undefined || contextValue === null) && mapping.defaultValue !== null) {
    return mapping.defaultValue;
  }
  return contextValue;
}

function resolveDerivation(param: ParamInput, context: Record<string, unknown>): string | null {
  if (param.derivationExpr === null) return null;
  const value = getNestedValue(context, param.derivationExpr);
  return value !== undefined && value !== null ? String(value) : null;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc !== null && acc !== undefined ? (acc as Record<string, unknown>)[key] : undefined,
      obj,
    );
}

function applyTransform(value: unknown, expr: string): unknown {
  const normalized = expr.toUpperCase().trim();

  if (normalized === 'UPPER(VALUE)') {
    return typeof value === 'string' ? value.toUpperCase() : value;
  }
  if (normalized === 'LOWER(VALUE)') {
    return typeof value === 'string' ? value.toLowerCase() : value;
  }
  if (normalized === 'TRIM(VALUE)') {
    return typeof value === 'string' ? value.trim() : value;
  }

  // Unsupported transform — pass through
  return value;
}
