/**
 * @contract UX-MCP-001
 * Page: Catálogo de tipos de ação MCP — read-only reference.
 * Route: /mcp/action-types
 *
 * Static reference catalog. No backend CRUD — displayed from known constants.
 * When a backend becomes available, swap to useQuery.
 */

import { Badge } from '@shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';

interface ActionTypeEntry {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string;
  readonly category: 'DATA' | 'INTEGRATION' | 'WORKFLOW' | 'NOTIFICATION';
}

const CATEGORY_VARIANT: Record<ActionTypeEntry['category'], 'default' | 'secondary' | 'outline'> = {
  DATA: 'default',
  INTEGRATION: 'secondary',
  WORKFLOW: 'outline',
  NOTIFICATION: 'outline',
};

/**
 * Static catalog — when backend endpoint /admin/mcp-action-types is
 * implemented, replace this array with a useQuery hook.
 */
const ACTION_TYPES: ActionTypeEntry[] = [
  {
    id: 'at-001',
    codigo: 'DATA_WRITE',
    nome: 'Escrita de Dados',
    descricao: 'Ações que criam ou modificam registros via SmartGrid',
    category: 'DATA',
  },
  {
    id: 'at-002',
    codigo: 'DATA_READ',
    nome: 'Leitura de Dados',
    descricao: 'Ações de consulta e exportação de dados',
    category: 'DATA',
  },
  {
    id: 'at-003',
    codigo: 'INTEGRATION_CALL',
    nome: 'Chamada de Integração',
    descricao: 'Ações que disparam rotinas de integração Protheus',
    category: 'INTEGRATION',
  },
  {
    id: 'at-004',
    codigo: 'WORKFLOW_TRIGGER',
    nome: 'Gatilho de Workflow',
    descricao: 'Ações que iniciam ou avançam etapas de processos',
    category: 'WORKFLOW',
  },
  {
    id: 'at-005',
    codigo: 'NOTIFICATION',
    nome: 'Notificação',
    descricao: 'Ações que enviam alertas e notificações',
    category: 'NOTIFICATION',
  },
];

export function McpActionTypesPage() {
  return (
    <div className="-m-6">
      <div className="flex items-center justify-between border-b border-a1-border bg-white px-6 py-4.5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-lg font-extrabold tracking-[-0.4px] text-a1-text-primary">
            Tipos de Ação MCP
          </h1>
          <p className="font-display text-[11px] text-a1-text-hint">
            Catálogo de referência para classificação de ações de agentes
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="rounded-lg border border-a1-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTION_TYPES.map((at) => (
                <TableRow key={at.id}>
                  <TableCell className="font-medium font-mono text-xs">{at.codigo}</TableCell>
                  <TableCell>{at.nome}</TableCell>
                  <TableCell>
                    <Badge variant={CATEGORY_VARIANT[at.category]}>{at.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-a1-text-auxiliary">{at.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
