import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { BulkDeletePage } from '@modules/smartgrid/pages/BulkDeletePage';

interface SmartGridSearch {
  framerId?: string;
  objectType?: string;
  targetEndpoint?: string;
}

const STORAGE_PREFIX = 'smartgrid-delete-';

export const Route = createRoute({
  path: '/dados/$modulo/$rotina/exclusao-em-massa',
  getParentRoute: () => authRoute,
  validateSearch: (search: Record<string, unknown>): SmartGridSearch => ({
    framerId: search.framerId as string | undefined,
    objectType: search.objectType as string | undefined,
    targetEndpoint: search.targetEndpoint as string | undefined,
  }),
  component: BulkDeleteWrapper,
});

function BulkDeleteWrapper() {
  const { modulo, rotina } = Route.useParams();
  const { framerId, objectType, targetEndpoint } = Route.useSearch();
  const navigate = useNavigate();

  const storageKey = `${STORAGE_PREFIX}${modulo}-${rotina}`;
  const stored = sessionStorage.getItem(storageKey);
  const records = stored ? JSON.parse(stored) : [];

  if (records.length === 0) {
    navigate({ to: '/dados/$modulo/$rotina', params: { modulo, rotina } });
    return null;
  }

  return (
    <BulkDeletePage
      framerId={framerId ?? modulo}
      objectType={objectType ?? rotina}
      records={records}
      targetEndpoint={targetEndpoint ?? `/api/v1/admin/${modulo}`}
      onNavigateBack={() => {
        sessionStorage.removeItem(storageKey);
        navigate({ to: '/dados/$modulo/$rotina', params: { modulo, rotina } });
      }}
    />
  );
}
