/**
 * @contract DATA-008 §2.3
 *
 * Value Object for field mapping types.
 * Determines how source fields are mapped to the outgoing HTTP payload.
 */

export const MAPPING_TYPES = ['FIELD', 'PARAM', 'HEADER', 'FIXED_VALUE', 'DERIVED'] as const;
export type MappingType = (typeof MAPPING_TYPES)[number];

export function isValidMappingType(value: string): value is MappingType {
  return (MAPPING_TYPES as readonly string[]).includes(value);
}
