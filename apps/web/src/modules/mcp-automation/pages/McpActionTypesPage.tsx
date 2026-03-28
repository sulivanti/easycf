/**
 * @contract UX-MCP-001
 * Page: Catálogo de tipos de ação MCP — read-only reference.
 * Route: /mcp/action-types
 *
 * Static reference catalog. No backend CRUD — displayed from known constants.
 * When a backend becomes available, swap to useQuery.
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { PageHeader } from '@shared/ui/page-header';
import { StatusBadge } from '@shared/ui/status-badge';

interface ActionTypeEntry {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string;
  readonly category: 'DATA' | 'INTEGRATION' | 'WORKFLOW' | 'NOTIFICATION';
}

const CATEGORY_STATUS: Record<ActionTypeEntry['category'], 'success' | 'info' | 'neutral' | 'purple'> = {
  DATA: 'success',
  INTEGRATION: 'info',
  WORKFLOW: 'neutral',
  NOTIFICATION: 'purple',
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
      <PageHeader
        title="Tipos de Ação MCP"
        description="Catálogo de referência para classificação de ações de agentes"
      />

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
                    <StatusBadge status={CATEGORY_STATUS[at.category]}>{at.category}</StatusBadge>
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
