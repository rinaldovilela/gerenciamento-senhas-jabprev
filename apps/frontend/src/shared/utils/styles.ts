export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function classNames(
  obj: Record<string, boolean | undefined>
): string {
  return Object.entries(obj)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(' ');
}
