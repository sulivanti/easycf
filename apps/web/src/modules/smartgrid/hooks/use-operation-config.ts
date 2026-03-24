/**
 * @contract FR-002
 * React Query hook for loading MOD-007 operation config on mount.
 * queryKey: ['smartgrid', 'operation-config', framerId, objectType]
 */

import { useQuery } from '@tanstack/react-query';
import {
  loadOperationConfig,
  mapResponseToColumns,
  mapResponseToOperationConfig,
} from '../api/smartgrid.api';
import type { OperationConfig, GridColumn } from '../types/smartgrid.types';

/** @contract FR-002 — load operation config via motor evaluation */
export function useOperationConfig(framerId: string | undefined, objectType: string | undefined) {
  const query = useQuery({
    queryKey: ['smartgrid', 'operation-config', framerId, objectType],
    queryFn: ({ signal }) => loadOperationConfig(framerId!, objectType!, signal),
    enabled: Boolean(framerId && objectType),
  });

  const columns: GridColumn[] = query.data ? mapResponseToColumns(query.data) : [];
  const config: OperationConfig | null =
    query.data && framerId && objectType
      ? mapResponseToOperationConfig(framerId, objectType, query.data)
      : null;

  return { ...query, columns, config } as const;
}
