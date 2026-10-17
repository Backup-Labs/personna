export type ParsedMobileMoney = { amountMinor: number; direction: "INCOME" | "EXPENSE"; counterparty: string | null; feeMinor: number | null; balanceMinor: number | null; transactionId: string | null };

/** Conservative parser: it returns a candidate for human review and never saves or guesses a currency conversion. */
export function parseMobileMoney(text: string): ParsedMobileMoney | null {
  if (text.length > 8_000) return null;
  const normalized = text.replace(/\u00a0/g, " ");
  const amountMatch = normalized.match(/(?:RWF|FRW|RF)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:RWF|FRW|RF)/i)
    ?? normalized.match(/(?:sent|paid|received|deposit(?:ed)?|payment)\D{0,24}([\d,]+(?:\.\d{1,2})?)/i);
  if (!amountMatch) return null;
  const amount = Number(amountMatch[1].replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0 || amount > Number.MAX_SAFE_INTEGER) return null;
  const lower = normalized.toLowerCase();
  const direction = /received|deposit(?:ed)?|from\s+/i.test(normalized) ? "INCOME" : /sent|paid|to\s+/.test(lower) ? "EXPENSE" : null;
  if (!direction) return null;
  const feeMatch = normalized.match(/(?:fee|charge)\D{0,12}([\d,]+)/i);
  const balanceMatch = normalized.match(/(?:balance|remaining)\D{0,12}([\d,]+)/i);
  const idMatch = normalized.match(/(?:transaction|txn|ref(?:erence)?)\s*(?:id|no|number|#)?\s*[:#-]?\s*([A-Z0-9]{6,})/i);
  const names = normalized.match(/(?:from|to)\s+([A-Z][\p{L}' -]{1,50})/iu);
  return {
    amountMinor: Math.round(amount), direction,
    counterparty: names?.[1]?.trim() ?? null,
    feeMinor: feeMatch ? Number(feeMatch[1].replace(/,/g, "")) : null,
    balanceMinor: balanceMatch ? Number(balanceMatch[1].replace(/,/g, "")) : null,
    transactionId: idMatch?.[1] ?? null,
  };
}
