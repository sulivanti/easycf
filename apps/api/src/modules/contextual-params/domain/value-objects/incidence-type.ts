/**
 * @contract DATA-007-M01, FR-007-M01
 *
 * Value Object for incidence rule type: OBR (obrigatório) | OPC (opcional) | AUTO (automático).
 * Default is 'OBR'. Used to classify the nature of the incidence binding.
 */

export const INCIDENCE_TYPES = ['OBR', 'OPC', 'AUTO'] as const;
export type IncidenceType = (typeof INCIDENCE_TYPES)[number];
