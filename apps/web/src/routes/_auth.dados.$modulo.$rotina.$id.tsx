import { createRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Route as authRoute } from './_auth';
import { Skeleton } from '@shared/ui/skeleton';
import { Button } from '@shared/ui/button';
import { RecordEditPage } from '@modules/smartgrid/pages/RecordEditPage';

interface SmartGridSearch {
  framerId?: string;
  objectType?: string;
  targetEndpoint?: string;
}

export const Route = createRoute({
  path: '/dados/$modulo/$rotina/$id',
  getParentRoute: () => authRoute,
  validateSearch: (search: Record<string, unknown>): SmartGridSearch => ({
    framerId: search.framerId as string | undefined,
    objectType: search.objectType as string | undefined,
    targetEndpoint: search.targetEndpoint as string | undefined,
  }),
  component: RecordEditWrapper,
});

function RecordEditWrapper() {
  const { modulo, rotina, id } = Route.useParams();
  const { framerId, objectType, targetEndpoint } = Route.useSearch();
  const navigate = useNavigate();

  const endpoint = targetEndpoint ?? `/api/v1/admin/${modulo}`;

  const {
    data: record,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['smartgrid', 'record', endpoint, id],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${endpoint}/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': crypto.randomUUID(),
        },
        signal,
      });
      if (!res.ok) throw new Error('Erro ao carregar registro');
      return (await res.json()) as Record<string, unknown>;
    },
  });

  const handleBack = () => navigate({ to: '/dados/$modulo/$rotina', params: { modulo, rotina } });

  if (isLoading) {
    return (
      <div className="space-y-3 p-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !record) {
    return (
      <div role="alert" className="p-8 text-center">
        <p className="text-destructive">Não foi possível carregar o registro.</p>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <RecordEditPage
      framerId={framerId ?? modulo}
      objectType={objectType ?? rotina}
      recordId={id}
      currentRecordState={record}
      targetEndpoint={endpoint}
      onNavigateBack={handleBack}
    />
  );
}
