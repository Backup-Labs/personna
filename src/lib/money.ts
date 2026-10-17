export type Currency = "RWF" | "USD";

const currencyDigits: Record<Currency, number> = { RWF: 0, USD: 2 };

export function toMinor(amount: string | number, currency: Currency): number {
  const parsed = typeof amount === "number" ? amount : Number(amount.trim().replace(/,/g, ""));
  if (!Number.isFinite(parsed)) throw new Error("Enter a valid amount.");
  const result = Math.round(parsed * 10 ** currencyDigits[currency]);
  if (!Number.isSafeInteger(result)) throw new Error("Amount is too large.");
  return result;
}

export function fromMinor(amountMinor: number, currency: Currency): number {
  if (!Number.isSafeInteger(amountMinor)) throw new Error("Minor-unit amount must be a safe integer.");
  return amountMinor / 10 ** currencyDigits[currency];
}

export function formatMoney(amountMinor: number, currency: Currency, locale = "en-RW"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: currencyDigits[currency] })
    .format(fromMinor(amountMinor, currency));
}

export function accountBalance(openingBalanceMinor: number, transactions: { type: "INCOME" | "EXPENSE" | "TRANSFER"; amountMinor: number; accountId: string; counterpartAccountId?: string | null }[], accountId: string): number {
  return transactions.reduce((balance, transaction) => {
    if (transaction.accountId === accountId) {
      if (transaction.type === "INCOME") return balance + transaction.amountMinor;
      if (transaction.type === "EXPENSE" || transaction.type === "TRANSFER") return balance - transaction.amountMinor;
    }
    if (transaction.type === "TRANSFER" && transaction.counterpartAccountId === accountId) return balance + transaction.amountMinor;
    return balance;
  }, openingBalanceMinor);
}
