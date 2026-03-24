/**
 * @contract FR-005, UX-001 (UX-003), BR-008
 *
 * Lógica de saudação por período do dia.
 * Horário local do browser: 5h–12h=dia, 12h–18h=tarde, 18h–5h=noite.
 */

type GreetingPeriod = 'morning' | 'afternoon' | 'evening';

const GREETINGS: Record<GreetingPeriod, string> = {
  morning: 'Bom dia',
  afternoon: 'Boa tarde',
  evening: 'Boa noite',
};

export function getGreetingPeriod(hour: number): GreetingPeriod {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

export function getGreeting(name: string, now: Date = new Date()): string {
  const period = getGreetingPeriod(now.getHours());
  return `${GREETINGS[period]}, ${name}!`;
}
