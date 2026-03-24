/**
 * @contract BR-004, UX-MCP-001
 *
 * One-time API key modal. Key displayed ONCE after create or rotate.
 * Close button disabled until user copies key and confirms checkbox.
 * Key eliminated from component memory on close.
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
        <DialogHeader>
          <DialogTitle>API Key Gerada</DialogTitle>
          <DialogDescription className="text-destructive font-semibold">
            Esta chave sera exibida apenas uma vez. Copie-a agora.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
            <code className="flex-1 break-all font-mono text-sm">{apiKey}</code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={!copied}
              className="h-4 w-4 rounded border-input"
            />
            Copiei e armazenei a chave com seguranca
          </label>
        </div>

        <DialogFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <Button onClick={onClose} disabled={!confirmed}>
                    Fechar
                  </Button>
                </span>
              </TooltipTrigger>
              {!confirmed && (
                <TooltipContent>Confirme que copiou a chave antes de fechar.</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
