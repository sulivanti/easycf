/**
 * @contract UX-007 §2.5, FR-002, BR-001
 * FramerDrawer — Drawer lateral para criar/editar enquadrador.
 * Codigo uppercase e imutavel apos criacao (BR-001).
 */

import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  Button,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@shared/ui';
import type {
  FramerListItemDTO,
  FramerTypeListItemDTO,
  CreateFramerRequest,
  UpdateFramerRequest,
} from '../types/contextual-params.types.js';
import { COPY } from '../types/view-model.js';

interface FramerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  framer?: FramerListItemDTO;
  framerTypes: FramerTypeListItemDTO[];
  loading: boolean;
  onSave: (data: CreateFramerRequest | UpdateFramerRequest) => void;
}

export function FramerDrawer({
  open,
  onOpenChange,
  mode,
  framer,
  framerTypes,
  loading,
  onSave,
}: FramerDrawerProps) {
  const [codigo, setCodigo] = useState(framer?.codigo ?? '');
  const [nome, setNome] = useState(framer?.nome ?? '');
  const [framerTypeId, setFramerTypeId] = useState(framer?.framer_type_id ?? '');
  const [validFrom, setValidFrom] = useState(framer?.valid_from?.slice(0, 10) ?? '');
  const [validUntil, setValidUntil] = useState(framer?.valid_until?.slice(0, 10) ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      onSave({
        codigo: codigo.toUpperCase(),
        nome,
        framer_type_id: framerTypeId,
        valid_from: new Date(validFrom).toISOString(),
        valid_until: validUntil ? new Date(validUntil).toISOString() : undefined,
      });
    } else {
      onSave({
        nome,
        valid_from: validFrom ? new Date(validFrom).toISOString() : undefined,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed inset-y-0 right-0 w-[400px] rounded-none">
        <DrawerHeader>
          <DrawerTitle>{mode === 'create' ? 'Novo Enquadrador' : 'Editar Enquadrador'}</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="px-4 flex flex-col gap-4 flex-1">
          <div className="space-y-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="framer-codigo">Codigo *</Label>
                </TooltipTrigger>
                {mode === 'edit' && <TooltipContent>{COPY.tooltip_codigo_imutavel}</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
            <Input
              id="framer-codigo"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              disabled={mode === 'edit'}
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="framer-nome">Nome *</Label>
            <Input
              id="framer-nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          {mode === 'create' && (
            <div className="space-y-1.5">
              <Label htmlFor="framer-type">Tipo *</Label>
              <select
                id="framer-type"
                required
                value={framerTypeId}
                onChange={(e) => setFramerTypeId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {framerTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="framer-valid-from">Valido de *</Label>
            <Input
              id="framer-valid-from"
              type="date"
              required={mode === 'create'}
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="framer-valid-until">Valido ate</Label>
            <Input
              id="framer-valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>

          <DrawerFooter className="mt-auto px-0">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
