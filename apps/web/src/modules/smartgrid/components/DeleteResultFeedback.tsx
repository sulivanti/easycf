/**
 * @contract UX-SGR-003
 * Final feedback after bulk delete: ✅ deleted / ❌ failed per record.
 */

import { Button } from '@shared/ui/button';
import type { DeleteBatchResult } from '../types/smartgrid.types';
import { COPY } from '../types/smartgrid.types';

interface DeleteResultFeedbackProps {
  readonly result: DeleteBatchResult;
  readonly onClose: () => void;
}

/** @contract UX-SGR-003 — delete-result-feedback component */
export function DeleteResultFeedback({ result, onClose }: DeleteResultFeedbackProps) {
  const allSuccess = result.failed === 0;
  const summaryMessage = allSuccess
    ? COPY.deleteSuccess(result.succeeded)
    : COPY.deletePartial(result.succeeded, result.failed);

  return (
    <div className="p-4">
      <h3 className="mt-0 text-lg font-semibold">Resultado da exclusão</h3>

      <p
        role="alert"
        className={`mb-4 font-semibold ${allSuccess ? 'text-green-600' : 'text-amber-500'}`}
      >
        {summaryMessage}
      </p>

      <ul className="list-none p-0">
        {result.results.map((r) => (
          <li
            key={r.record_id}
            className={`mb-1 border-l-3 px-3 py-1.5 text-sm ${
              r.success ? 'border-green-500 bg-green-50' : 'border-destructive bg-red-50'
            }`}
          >
            {r.success ? '✅' : '❌'} {r.record_id}
            {r.error && <span className="ml-2 text-muted-foreground">— {r.error}</span>}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
}
