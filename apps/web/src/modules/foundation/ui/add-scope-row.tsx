/**
 * @contract UX-000-M04, 07-role-form-spec
 * AddScopeRow — input + "Adicionar" button in a row. gap:12px.
 */

import { useState } from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';

const SCOPE_REGEX = /^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$/;

interface AddScopeRowProps {
  existingScopes: string[];
  onAdd: (scope: string) => void;
}

function AddScopeRow({ existingScopes, onAdd }: AddScopeRowProps) {
  const [input, setInput] = useState('');

  function handleAdd() {
    const trimmed = input.trim();
    if (trimmed && SCOPE_REGEX.test(trimmed) && !existingScopes.includes(trimmed)) {
      onAdd(trimmed);
      setInput('');
    }
  }

  return (
    <div className="mt-4 flex gap-3">
      <Input
        type="text"
        placeholder="domínio:entidade:ação"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        }}
        className="h-[42px] flex-1 rounded-[10px]"
      />
      <Button type="button" variant="outline" onClick={handleAdd} className="h-[42px] w-[110px]">
        Adicionar
      </Button>
    </div>
  );
}

export { AddScopeRow };
export type { AddScopeRowProps };
