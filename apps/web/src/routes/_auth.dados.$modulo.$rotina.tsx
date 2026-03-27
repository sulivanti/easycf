import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { DataViewPage } from '@modules/smartgrid/pages/DataViewPage';

interface SmartGridSearch {
  framerId?: string;
  objectType?: string;
  targetEndpoint?: string;
}

const STORAGE_PREFIX = 'smartgrid-delete-';

export const Route = createRoute({
  path: '/dados/$modulo/$rotina',
  getParentRoute: () => authRoute,
  validateSearch: (search: Record<string, unknown>): SmartGridSearch => ({
    framerId: search.framerId as string | undefined,
    objectType: search.objectType as string | undefined,
    targetEndpoint: search.targetEndpoint as string | undefined,
  }),
  component: DataViewWrapper,
});

function DataViewWrapper() {
  const { modulo, rotina } = Route.useParams();
  const { framerId, objectType, targetEndpoint } = Route.useSearch();
  const navigate = useNavigate();

  const resolvedFramerId = framerId ?? modulo;
  const resolvedObjectType = objectType ?? rotina;
  const resolvedEndpoint = targetEndpoint ?? `/api/v1/admin/${modulo}`;

  return (
    <DataViewPage
      framerId={resolvedFramerId}
      objectType={resolvedObjectType}
      targetEndpoint={resolvedEndpoint}
      onNavigateToEdit={(recordId) =>
        navigate({
          to: '/dados/$modulo/$rotina/$id',
          params: { modulo, rotina, id: recordId },
          search: { framerId: resolvedFramerId, objectType: resolvedObjectType, targetEndpoint: resolvedEndpoint },
        })
      }
      onNavigateToBulkInsert={() =>
        navigate({
          to: '/dados/$modulo/$rotina/inclusao-em-massa',
          params: { modulo, rotina },
          search: { framerId: resolvedFramerId, objectType: resolvedObjectType, targetEndpoint: resolvedEndpoint },
        })
      }
      onNavigateToBulkDelete={(records) => {
        const storageKey = `${STORAGE_PREFIX}${modulo}-${rotina}`;
        sessionStorage.setItem(storageKey, JSON.stringify(records));
        navigate({
          to: '/dados/$modulo/$rotina/exclusao-em-massa',
          params: { modulo, rotina },
          search: { framerId: resolvedFramerId, objectType: resolvedObjectType, targetEndpoint: resolvedEndpoint },
        });
      }}
    />
  );
}
