export default function fmt(d: Date): string {
  return `${d.getFullYear()}-${('' + (1 + d.getMonth())).padStart(2, '0')}-${('' + d.getDate()).padStart(2, '0')}`;
}
