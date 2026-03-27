import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { BulkInsertPage } from '@modules/smartgrid/pages/BulkInsertPage';

interface SmartGridSearch {
  framerId?: string;
  objectType?: string;
  targetEndpoint?: string;
  operationName?: string;
}

export const Route = createRoute({
  path: '/dados/$modulo/$rotina/inclusao-em-massa',
  getParentRoute: () => authRoute,
  validateSearch: (search: Record<string, unknown>): SmartGridSearch => ({
    framerId: search.framerId as string | undefined,
    objectType: search.objectType as string | undefined,
    targetEndpoint: search.targetEndpoint as string | undefined,
    operationName: search.operationName as string | undefined,
  }),
  component: BulkInsertWrapper,
});

function BulkInsertWrapper() {
  const { modulo, rotina } = Route.useParams();
  const { framerId, objectType, targetEndpoint, operationName } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <BulkInsertPage
      framerId={framerId ?? modulo}
      objectType={objectType ?? rotina}
      operationName={operationName ?? `Inclusão em Massa — ${rotina}`}
      targetEndpoint={targetEndpoint ?? `/api/v1/admin/${modulo}`}
      onNavigateBack={() => navigate({ to: '/dados/$modulo/$rotina', params: { modulo, rotina } })}
    />
  );
}
