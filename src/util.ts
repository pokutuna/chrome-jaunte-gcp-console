export function escapeXML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  const set = new Set<T>(a);
  b.forEach(i => set.add(i));
  return set;
}

export function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  const set = new Set<T>();
  a.forEach(i => b.has(i) && set.add(i));
  return set;
}
