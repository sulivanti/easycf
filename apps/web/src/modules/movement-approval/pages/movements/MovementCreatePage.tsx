/**
 * @contract UX-009 §30, UX-009-M01 D5
 *
 * View ③ — Cadastro de Movimento (/approvals/movements/new)
 * Two-column: formulário 11 campos (2/3) + preview motor de regras (1/3 sticky)
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { UserIcon, ClipboardIcon, ZapIcon, ClockIcon, UploadCloudIcon } from 'lucide-react';
import { Button } from '@shared/ui';
import { useEvaluate } from '../../hooks/use-engine.js';

// ── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  objectType: string;
  operation: string;
  docNumber: string;
  value: string;
  company: string;
  requester: string;
  origin: string;
  date: string;
  description: string;
  observations: string;
}

const OBJECT_TYPES = [
  { value: '', label: 'Selecione o tipo...' },
  { value: 'pedido_compra', label: 'Pedido de Compra' },
  { value: 'nota_fiscal', label: 'Nota Fiscal' },
  { value: 'ordem_servico', label: 'Ordem de Serviço' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'requisicao', label: 'Requisição' },
];

const OPERATIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
];

const COMPANIES = [
  { value: '', label: 'Selecione a empresa...' },
  { value: 'a1_engenharia', label: 'A1 Engenharia' },
  { value: 'a1_energia', label: 'A1 Energia' },
  { value: 'a1_industrial', label: 'A1 Industrial' },
  { value: 'a1_agro', label: 'A1 Agro' },
];

const ORIGINS = [
  { value: 'PORTAL', label: 'PORTAL' },
  { value: 'PROTHEUS', label: 'PROTHEUS' },
  { value: 'API', label: 'API' },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseCurrency(value: string): number | undefined {
  if (!value) return undefined;
  const num = parseFloat(value.replace(/\./g, '').replace(',', '.'));
  return isNaN(num) ? undefined : num;
}

// ── Component ────────────────────────────────────────────────────────────────

export function MovementCreatePage() {
  const navigate = useNavigate();
  const evaluateMut = useEvaluate();

  const [form, setForm] = useState<FormState>({
    objectType: '',
    operation: '',
    docNumber: '',
    value: '',
    company: '',
    requester: '',
    origin: 'PORTAL',
    date: today(),
    description: '',
    observations: '',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  function setField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  // Preview: trigger on objectType + value change
  useEffect(() => {
    const numValue = parseCurrency(form.value);
    if (form.objectType && form.operation && numValue !== undefined) {
      const timer = setTimeout(() => {
        evaluateMut.mutate({
          operation: form.operation,
          entity_type: form.objectType,
          entity_id: 'preview',
          value: numValue,
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [form.objectType, form.operation, form.value]);

  function handleDropZone(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.objectType || !form.operation || !form.docNumber || !form.value) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    // In a real app, call createMovement API here
    toast.success('Movimento registrado com sucesso!');
    navigate({ to: '/approvals/movements' });
  }

  const preview = evaluateMut.data;
  const hasPreview = !!(form.objectType && form.operation && form.value);

  return (
    <div className="space-y-[var(--space-lg)]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-[11px] text-[#888888]">
        <span>Aprovação</span>
        <span className="text-[#E8E8E6]">/</span>
        <Link to="/approvals/movements" className="hover:text-[#111111]">
          Movimentos
        </Link>
        <span className="text-[#E8E8E6]">/</span>
        <span className="font-semibold text-[#111111]">Novo Movimento</span>
      </nav>

      <div className="mb-2">
        <h1 className="text-[28px] font-extrabold leading-[1.2] tracking-[-1px] text-[#111111]">
          Novo Movimento
        </h1>
        <p className="mt-1 text-[13px] text-[#888888]">
          Registre um novo movimento para o motor de aprovação.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Form Column ── */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-[10px] border border-[#E8E8E6] bg-white p-6 lg:col-span-2"
        >
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Tipo de Objeto <span className="text-[#dc2626]">*</span>
              </label>
              <select
                value={form.objectType}
                onChange={setField('objectType')}
                required
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              >
                {OBJECT_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Operação <span className="text-[#dc2626]">*</span>
              </label>
              <select
                value={form.operation}
                onChange={setField('operation')}
                required
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              >
                {OPERATIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Número do Documento <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="text"
                value={form.docNumber}
                onChange={setField('docNumber')}
                placeholder="PED-2026-00422"
                required
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Valor R$ <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="text"
                value={form.value}
                onChange={setField('value')}
                placeholder="0,00"
                required
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 font-mono text-[13px] tabular-nums text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1]"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Empresa <span className="text-[#dc2626]">*</span>
              </label>
              <select
                value={form.company}
                onChange={setField('company')}
                required
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              >
                {COMPANIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Solicitante <span className="text-[#dc2626]">*</span>
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#CCCCCC]" />
                <input
                  type="text"
                  value={form.requester}
                  onChange={setField('requester')}
                  placeholder="Buscar usuário..."
                  required
                  className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white pl-9 pr-3 text-[13px] text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1]"
                />
              </div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Origem
              </label>
              <select
                value={form.origin}
                onChange={setField('origin')}
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              >
                {ORIGINS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Data
              </label>
              <input
                type="date"
                value={form.date}
                onChange={setField('date')}
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              />
            </div>
          </div>

          {/* Row 5 — Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Descrição / Objeto
            </label>
            <input
              type="text"
              value={form.description}
              onChange={setField('description')}
              placeholder="Texto livre..."
              className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1]"
            />
          </div>

          {/* Row 6 — Observations */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              Observações
            </label>
            <textarea
              rows={3}
              value={form.observations}
              onChange={setField('observations')}
              placeholder="Informações adicionais..."
              className="w-full resize-none rounded-md border border-[#E8E8E6] bg-white px-3 py-2 text-[13px] text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1]"
            />
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDropZone}
            className={[
              'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors',
              isDragging ? 'border-[#2E86C1] bg-[#E3F2FD]' : 'border-[#E8E8E6] bg-[#F5F5F3]',
            ].join(' ')}
          >
            <UploadCloudIcon className="size-8 text-[#CCCCCC]" />
            <p className="text-[13px] text-[#888888]">
              Arraste arquivos ou{' '}
              <label className="cursor-pointer font-semibold text-[#2E86C1] hover:underline">
                clique para selecionar
                <input
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.jpg,.jpeg,.png"
                  className="sr-only"
                  onChange={handleFileInput}
                />
              </label>
            </p>
            <p className="text-[11px] text-[#CCCCCC]">PDF, XLSX, JPG, PNG · máx. 10 MB</p>
            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white px-3 py-0.5 text-[11px] text-[#888888] shadow-sm border border-[#E8E8E6]"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E8E8E6] pt-4">
            <Link to="/approvals/movements">
              <Button variant="outline" type="button" className="border-[#E8E8E6]">
                Cancelar
              </Button>
            </Link>
            <button
              type="submit"
              className="rounded-md bg-[#2E86C1] px-6 py-2 text-[13px] font-semibold text-white hover:bg-[#2573a7] transition-colors"
            >
              Registrar Movimento
            </button>
          </div>
        </form>

        {/* ── Preview Column ── */}
        <div className="lg:sticky lg:top-5 lg:self-start">
          <div className="rounded-[10px] border border-[#E8E8E6] bg-white p-6">
            <h2 className="mb-4 text-[14px] font-bold text-[#111111]">Simulação Motor de Regras</h2>

            {!hasPreview && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <ClipboardIcon className="size-10 text-[#CCCCCC]" />
                <p className="text-[13px] text-[#888888]">
                  Preencha Tipo, Operação e Valor para simular
                </p>
              </div>
            )}

            {hasPreview && evaluateMut.isPending && (
              <div className="flex items-center gap-2 py-4">
                <div className="size-4 animate-spin rounded-full border-2 border-[#2E86C1] border-t-transparent" />
                <p className="text-[13px] text-[#888888]">Simulando...</p>
              </div>
            )}

            {hasPreview && !evaluateMut.isPending && preview && (
              <div className="space-y-3">
                {preview.requires_approval ? (
                  <>
                    {/* Rule triggered */}
                    <div className="rounded-lg bg-[#E3F2FD] p-4">
                      <p className="text-[12px] font-semibold text-[#2E86C1]">Regra Acionada</p>
                      <p className="mt-1 text-[13px] text-[#111111]">
                        {preview.control_rule_id ?? 'Regra de controle'}
                      </p>
                      {preview.matched_levels.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {preview.matched_levels.map((level) => (
                            <div
                              key={level.id}
                              className="flex items-center gap-2 text-[12px] text-[#888888]"
                            >
                              <span className="rounded-full bg-[#2E86C1] px-2 py-0.5 text-[10px] font-bold text-white">
                                Nível {level.level}
                              </span>
                              SLA: {level.sla_hours}h
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Estimated time */}
                    <div className="flex items-center gap-2 rounded-lg bg-[#fefce8] p-3">
                      <ClockIcon className="size-4 text-[#ca8a04]" />
                      <p className="text-[12px] text-[#92400e]">
                        Tempo estimado:{' '}
                        {preview.matched_levels.reduce((acc, l) => acc + l.sla_hours, 0)}h
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg bg-[#f0fdf4] p-4">
                    <ZapIcon className="size-5 text-[#16a34a]" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#16a34a]">Auto-aprovação</p>
                      <p className="text-[11px] text-[#888888]">
                        Este movimento não requer aprovação manual.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasPreview && !evaluateMut.isPending && !preview && !evaluateMut.isError && (
              <p className="text-[13px] text-[#888888]">Nenhuma regra encontrada.</p>
            )}

            {evaluateMut.isError && (
              <div className="rounded-lg bg-[#fee2e2] p-3 text-[12px] text-[#dc2626]">
                Erro ao simular. Verifique os dados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
