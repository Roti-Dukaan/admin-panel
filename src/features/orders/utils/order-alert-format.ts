export function formatOrderCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPaymentMethod(method?: string): string {
  if (!method) return "Unknown";
  const upper = method.toUpperCase();
  if (upper === "COD") return "Cash on Delivery";
  if (upper === "ONLINE") return "Online Payment";
  if (upper === "WALLET") return "Wallet";
  return method.replace(/_/g, " ");
}

export function isCodPayment(method?: string): boolean {
  return (method ?? "").toUpperCase() === "COD";
}

/** Split backend itemsSummary ("2× Roti, 1× Dal +1 more") into display lines. */
export function parseItemsSummary(summary: string): string[] {
  if (!summary.trim()) return [];
  const parts = summary.split(/,\s*/).filter(Boolean);
  const lines: string[] = [];
  for (const part of parts) {
    const moreMatch = part.match(/^(.+?)\s+\+(\d+)\s+more$/i);
    if (moreMatch) {
      lines.push(moreMatch[1].trim());
      lines.push(`+${moreMatch[2]} more item(s)`);
    } else {
      lines.push(part.trim());
    }
  }
  return lines;
}

export function formatElapsedSince(iso?: string): string {
  if (!iso) return "Just now";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}
