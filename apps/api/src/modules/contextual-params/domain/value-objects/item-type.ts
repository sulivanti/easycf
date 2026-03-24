/**
 * @contract DATA-007 E-007
 *
 * Value Object for the 7 types of parameterizable routine items.
 */

export const ITEM_TYPES = [
  'FIELD_VISIBILITY',
  'REQUIRED',
  'DEFAULT',
  'DOMAIN',
  'DERIVATION',
  'VALIDATION',
  'EVIDENCE',
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];
