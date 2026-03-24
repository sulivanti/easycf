/**
 * @contract UX-CASE-001
 *
 * Macrostage progress bar — shows completed / current / future stages.
 */

interface ProgressBarProps {
  stages: Array<{ id: string; name: string }>;
  currentStageId: string;
}

export function ProgressBar({ stages, currentStageId }: ProgressBarProps) {
  const currentIdx = stages.findIndex((s) => s.id === currentStageId);

  return (
    <div className="flex items-center gap-1 w-full py-3">
      {stages.map((stage, idx) => {
        const state = idx < currentIdx ? 'completed' : idx === currentIdx ? 'current' : 'future';
        return (
          <div key={stage.id} className="flex items-center gap-1 flex-1 min-w-0">
            <div
              className={`
                h-2 flex-1 rounded-full transition-colors
                ${state === 'completed' ? 'bg-green-500' : ''}
                ${state === 'current' ? 'bg-blue-500' : ''}
                ${state === 'future' ? 'bg-gray-200' : ''}
              `}
              title={`${stage.name}${state === 'current' ? ' (atual)' : ''}`}
            />
          </div>
        );
      })}
    </div>
  );
}
