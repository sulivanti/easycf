/**
 * @contract FR-002, UX-001
 * React Query hook for org-units tree.
 * queryKey: ['org-units', 'tree']
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchOrgTree } from '../api/org-units.api.js';
import { toTreeNodeVM } from '../types/org-units.types.js';

export const ORG_TREE_KEY = ['org-units', 'tree'] as const;

export function useOrgTree() {
  return useQuery({
    queryKey: [...ORG_TREE_KEY],
    queryFn: ({ signal }) => fetchOrgTree(signal),
    select: (data) => data.tree.map(toTreeNodeVM),
  });
}

export function useInvalidateOrgTree() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ORG_TREE_KEY });
}
