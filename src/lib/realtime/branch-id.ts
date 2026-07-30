/** Normalize branch ids for socket payload ↔ workspace comparisons. */
export function normalizeBranchId(id: string | null | undefined): string | null {
  if (id == null) return null;
  const trimmed = String(id).trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
}

export function branchIdsMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const left = normalizeBranchId(a);
  const right = normalizeBranchId(b);
  if (!left || !right) return true;
  return left === right;
}
