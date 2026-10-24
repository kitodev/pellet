export type Insulation = 'weak' | 'medium' | 'good';
export function estimateHeating(area: number, insulation: Insulation, people: number) {
  const factor = { weak: 0.06, medium: 0.045, good: 0.03 }[insulation];
  return Math.ceil((area * 2.7 * factor + people) * 1.1);
}
