/**
 * @contract UX-002, 12-departments-spec §6, BR-014, BR-017
 * Drawer lateral (480px) para criação/edição de departamento.
 * Campos: codigo, nome, descricao, cor (color picker).
 * Codigo é ReadOnly no modo edição (BR-014).
 */

import { useState, useEffect } from 'react';
import { ColorPicker } from './ColorPicker.js';
import type {
  DepartmentDetailDTO,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '../types/departments.types.js';

type DrawerMode = 'create' | 'edit';

interface DepartmentDrawerProps {
  mode: DrawerMode;
  department?: DepartmentDetailDTO | null;
  onClose: () => void;
  onSubmitCreate: (data: CreateDepartmentRequest) => void;
  onSubmitUpdate: (data: UpdateDepartmentRequest) => void;
  isLoading?: boolean;
  fieldErrors?: Record<string, string>;
}

export function DepartmentDrawer({
  mode,
  department,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  isLoading,
  fieldErrors,
}: DepartmentDrawerProps) {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && department) {
      setCodigo(department.codigo);
      setNome(department.nome);
      setDescricao(department.descricao ?? '');
      setCor(department.cor);
    } else {
      setCodigo('');
      setNome('');
      setDescricao('');
      setCor(null);
    }
  }, [mode, department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      onSubmitCreate({
        codigo: codigo.trim(),
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        cor,
      });
    } else {
      onSubmitUpdate({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        cor,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-[480px] flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#E8E8E6] px-6">
          <h2 className="text-lg font-bold text-[#111]">
            {mode === 'create' ? 'Novo Departamento' : 'Editar Departamento'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#888] hover:text-[#333]"
            aria-label="Fechar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto p-6">
          <div className="flex-1 space-y-4">
            {/* Codigo */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888]">
                CÓDIGO
              </label>
              {mode === 'edit' ? (
                <div className="flex h-[42px] items-center rounded-lg border border-[#F0F0EE] bg-[#F8F8F6] px-3.5 text-sm font-medium text-[#111]">
                  {codigo}
                </div>
              ) : (
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  maxLength={50}
                  required
                  autoFocus
                  className="h-[42px] w-full rounded-lg border border-[#E8E8E6] px-3.5 text-sm font-medium text-[#111] focus:outline-none focus:ring-1 focus:ring-[#2E86C1]"
                />
              )}
              {fieldErrors?.codigo && (
                <p className="mt-1 text-[11px] font-medium text-[#E74C3C]">{fieldErrors.codigo}</p>
              )}
            </div>

            {/* Nome */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888]">
                NOME
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={200}
                required
                className="h-[42px] w-full rounded-lg border border-[#E8E8E6] px-3.5 text-sm font-medium text-[#111] focus:outline-none focus:ring-1 focus:ring-[#2E86C1]"
              />
            </div>

            {/* Descricao */}
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888]">
                DESCRIÇÃO
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full resize-y rounded-lg border border-[#E8E8E6] px-3.5 py-2.5 text-sm font-medium text-[#111] focus:outline-none focus:ring-1 focus:ring-[#2E86C1]"
              />
            </div>

            {/* Cor */}
            <ColorPicker value={cor} onChange={setCor} error={fieldErrors?.cor} />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-[#E8E8E6] pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-[#E8E8E6] px-5 text-[13px] font-semibold text-[#555] hover:bg-[#F8F8F6]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 rounded-lg bg-[#2E86C1] px-5 text-[13px] font-bold text-white hover:bg-[#2574A9] disabled:opacity-60"
            >
              {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
