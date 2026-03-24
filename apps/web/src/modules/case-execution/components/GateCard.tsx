/**
 * @contract UX-CASE-001, FR-004, FR-005
 *
 * Gate card with resolution by type (APPROVAL, DOCUMENT, CHECKLIST) and waive.
 * Uses shared Dialog for waive confirmation.
 */

import { useState } from 'react';
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/index.js';
import { GateStatusBadge } from './CaseStatusBadge.js';
import type { GateInstance, ChecklistItem } from '../types/case-execution.types.js';
import { GATE_TYPE_LABELS, COPY } from '../types/case-execution.types.js';

interface GateCardProps {
  gate: GateInstance;
  readonly: boolean;
  onResolve: (gateId: string, body: Record<string, unknown>) => void;
  onWaive: (gateId: string, motivo: string) => void;
  resolving: boolean;
  waiving: boolean;
}

export function GateCard({
  gate,
  readonly,
  onResolve,
  onWaive,
  resolving,
  waiving,
}: GateCardProps) {
  const [waiveOpen, setWaiveOpen] = useState(false);
  const [waiveMotivo, setWaiveMotivo] = useState('');
  const isPending = gate.status === 'PENDING';

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{gate.gate_name ?? gate.gate_id}</span>
          <span className="text-xs text-gray-500">{GATE_TYPE_LABELS[gate.gate_type]}</span>
          {gate.required && <span className="text-xs text-red-500 font-medium">Obrigatório</span>}
        </div>
        <GateStatusBadge status={gate.status} />
      </div>

      {gate.parecer && <p className="text-sm text-gray-600 italic">{gate.parecer}</p>}

      {!readonly && isPending && (
        <div className="flex flex-col gap-2">
          <GateResolutionForm gate={gate} onResolve={onResolve} resolving={resolving} />
          <div className="border-t pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWaiveOpen(true)}
              disabled={waiving}
              className="text-yellow-600"
            >
              Dispensar (Waive)
            </Button>
          </div>
        </div>
      )}

      {/* Waive confirmation dialog */}
      <Dialog open={waiveOpen} onOpenChange={setWaiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispensar Gate</DialogTitle>
            <DialogDescription>{COPY.confirm_waive}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="waive-motivo">Motivo (mínimo 20 caracteres)</Label>
            <textarea
              id="waive-motivo"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={waiveMotivo}
              onChange={(e) => setWaiveMotivo(e.target.value)}
              minLength={20}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaiveOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onWaive(gate.id, waiveMotivo);
                setWaiveOpen(false);
                setWaiveMotivo('');
              }}
              disabled={waiving || waiveMotivo.length < 20}
            >
              {waiving ? 'Dispensando...' : 'Confirmar Dispensa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Resolution by gate type ──────────────────────────────────────────────────

function GateResolutionForm({
  gate,
  onResolve,
  resolving,
}: {
  gate: GateInstance;
  onResolve: (gateId: string, body: Record<string, unknown>) => void;
  resolving: boolean;
}) {
  switch (gate.gate_type) {
    case 'APPROVAL':
      return <ApprovalForm gateId={gate.id} onResolve={onResolve} resolving={resolving} />;
    case 'DOCUMENT':
      return <DocumentForm gateId={gate.id} onResolve={onResolve} resolving={resolving} />;
    case 'CHECKLIST':
      return (
        <ChecklistForm
          gateId={gate.id}
          items={gate.checklist_items ?? []}
          onResolve={onResolve}
          resolving={resolving}
        />
      );
    default:
      return null;
  }
}

function ApprovalForm({
  gateId,
  onResolve,
  resolving,
}: {
  gateId: string;
  onResolve: (id: string, body: Record<string, unknown>) => void;
  resolving: boolean;
}) {
  const [parecer, setParecer] = useState('');

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label htmlFor={`parecer-${gateId}`}>Parecer</Label>
        <textarea
          id={`parecer-${gateId}`}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          rows={2}
          value={parecer}
          onChange={(e) => setParecer(e.target.value)}
          placeholder="Informe o parecer..."
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onResolve(gateId, { decision: 'APPROVED', parecer })}
          disabled={resolving || !parecer}
        >
          {resolving ? 'Aprovando...' : 'Aprovar'}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onResolve(gateId, { decision: 'REJECTED', parecer })}
          disabled={resolving || !parecer}
        >
          {resolving ? 'Reprovando...' : 'Reprovar'}
        </Button>
      </div>
    </div>
  );
}

function DocumentForm({
  gateId,
  onResolve,
  resolving,
}: {
  gateId: string;
  onResolve: (id: string, body: Record<string, unknown>) => void;
  resolving: boolean;
}) {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`doc-url-${gateId}`}>URL do documento</Label>
          <Input
            id={`doc-url-${gateId}`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`doc-name-${gateId}`}>Nome do arquivo</Label>
          <Input
            id={`doc-name-${gateId}`}
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="documento.pdf"
            className="mt-1"
          />
        </div>
      </div>
      <Button
        size="sm"
        onClick={() => onResolve(gateId, { evidence: { type: 'file', url, filename } })}
        disabled={resolving || !url || !filename}
      >
        {resolving ? 'Enviando...' : 'Enviar Documento'}
      </Button>
    </div>
  );
}

function ChecklistForm({
  gateId,
  items: initialItems,
  onResolve,
  resolving,
}: {
  gateId: string;
  items: ChecklistItem[];
  onResolve: (id: string, body: Record<string, unknown>) => void;
  resolving: boolean;
}) {
  const [items, setItems] = useState<ChecklistItem[]>(
    initialItems.map((i) => ({ ...i, checked: false })),
  );

  const allChecked = items.length > 0 && items.every((i) => i.checked);

  const toggle = (itemId: string) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)));
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <label key={item.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => toggle(item.id)}
            className="rounded border-gray-300"
          />
          {item.label}
        </label>
      ))}
      <Button
        size="sm"
        onClick={() => onResolve(gateId, { checklist_items: items })}
        disabled={resolving || !allChecked}
      >
        {resolving ? 'Resolvendo...' : 'Completar Checklist'}
      </Button>
    </div>
  );
}
