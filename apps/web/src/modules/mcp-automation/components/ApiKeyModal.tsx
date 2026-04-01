/**
 * @contract BR-004, UX-MCP-001, UX-010-M01 (D7)
 *
 * One-time API key modal. Key displayed ONCE after create or rotate.
 * Close button disabled until user copies key and confirms checkbox.
 * Key eliminated from component memory on close.
 *
 * D7 — Key icon, centered layout, full-width close button.
 */

import { useState, useCallback } from 'react';
import { KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@shared/ui';

interface ApiKeyModalProps {
  apiKey: string;
  onClose: () => void;
}

export function ApiKeyModal({ apiKey, onClose }: ApiKeyModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
  }, [apiKey]);

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (!confirmed) e.preventDefault();
        }}
        aria-label="Chave de API do agente"
      >
        {/* D7 — Centered layout with key icon */}
        <div className="flex flex-col items-center text-center">
          {/* D7 — Key icon 48x48 amber background */}
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-amber-100">
            <KeyRound className="size-6 text-amber-600" />
          </div>

          <DialogHeader className="items-center">
            <DialogTitle className="text-center">Chave de API Gerada</DialogTitle>
            <DialogDescription className="text-center font-semibold text-destructive">
              Esta chave será exibida apenas uma vez. Copie-a agora.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="my-4 space-y-4">
          {/* D7 — API key field with styled background */}
          <div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3">
            <code className="flex-1 break-all font-mono text-sm">{apiKey}</code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>

          <label className="flex items-center justify-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={!copied}
              className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
            />
            Copiei e armazenei a chave com segurança
          </label>
        </div>

        {/* D7 — Full-width close button */}
        <div className="w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block w-full">
                  <Button
                    onClick={onClose}
                    disabled={!confirmed}
                    className={`w-full ${
                      confirmed
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    Fechar
                  </Button>
                </span>
              </TooltipTrigger>
              {!confirmed && (
                <TooltipContent>Confirme que copiou a chave antes de fechar.</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
