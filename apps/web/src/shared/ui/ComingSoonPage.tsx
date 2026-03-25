import { Construction } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@shared/ui/button';

export function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20">
      <Construction className="size-16 text-muted-foreground" />
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">Módulo em construção</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
        </p>
      </div>
      <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>
        Voltar ao Dashboard
      </Button>
    </div>
  );
}

export default ComingSoonPage;
