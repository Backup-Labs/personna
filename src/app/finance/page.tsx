import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Plus, Scale, ShieldCheck, Target, Wallet } from "@/components/ui/icons";
import { ActionForm, Field } from "@/components/action-form";
import { AppShell, PageHeading, Surface } from "@/components/app-shell";
import { createAccountAction, createBudgetAction, createCategoryAction, createDebtAction, createSavingsGoalAction, createTransactionAction, updateTransactionAction } from "@/server/actions/core";
import { getDatabase } from "@/lib/db";
import { formatMoney, fromMinor } from "@/lib/money";
import { TransactionDeleteButton } from "@/components/transaction-delete-button";
import { fromZonedLocalDate, localDateKey, zonedMonthStart } from "@/lib/dates";
import { requireUserId } from "@/server/authenticated-user";
import type { AccountDocument, BudgetDocument, CategoryDocument, DebtDocument, SavingsGoalDocument, SettingsDocument, TransactionDocument } from "@/server/db/collections";
import { getAccountBalances } from "@/server/queries/finance";
import { StatTile } from "@/components/ui/stat-tile";
import { WeeklyBars } from "@/components/charts/weekly-bars";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const userId = await requireUserId(); const db = await getDatabase();
  const settings = await db.collection<SettingsDocument>("settings").findOne({ userId, deletedAt: null });
  const timezone = settings?.timezone ?? "Africa/Kigali"; const locale = settings?.locale ?? "en-RW"; const now = new Date(); const month = localDateKey(now, timezone).slice(0, 7);
  const monthStart = zonedMonthStart(now, timezone);
  const today = localDateKey(now, timezone);
  const sevenDaysAgo = new Date(`${today}T12:00:00.000Z`); sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  const startDay = sevenDaysAgo.toISOString().slice(0, 10);
  const [accounts, transactions, categories, budgets, savings, debts, monthFlows, weeklySpend] = await Promise.all([
    db.collection<AccountDocument>("accounts").find({ userId, deletedAt: null }).sort({ name: 1 }).toArray(),
    db.collection<TransactionDocument>("transactions").find({ userId, deletedAt: null }).sort({ occurredAt: -1 }).limit(100).toArray(),
    db.collection<CategoryDocument>("categories").find({ userId, deletedAt: null }).sort({ kind: 1, name: 1 }).toArray(),
    db.collection<BudgetDocument>("budgets").find({ userId, month, deletedAt: null }).toArray(),
    db.collection<SavingsGoalDocument>("savingsGoals").find({ userId, deletedAt: null }).sort({ deadline: 1 }).toArray(),
    db.collection<DebtDocument>("debts").find({ userId, deletedAt: null, balanceMinor: { $gt: 0 } }).sort({ dueDate: 1 }).toArray(),
    db.collection<TransactionDocument>("transactions").aggregate<{ _id: { currency: "RWF" | "USD"; type: "INCOME" | "EXPENSE" }; total: number }>([
      { $match: { userId, deletedAt: null, type: { $in: ["INCOME", "EXPENSE"] }, occurredAt: { $gte: monthStart, $lt: now } } },
      { $group: { _id: { currency: "$currency", type: "$type" }, total: { $sum: "$amountMinor" } } },
    ]).toArray(),
    db.collection<TransactionDocument>("transactions").aggregate<{ _id: string; total: number }>([
      { $match: { userId, deletedAt: null, type: "EXPENSE", currency: settings?.baseCurrency ?? "RWF", occurredAt: { $gte: fromZonedLocalDate(startDay, timezone), $lt: now } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$occurredAt", timezone } }, total: { $sum: "$amountMinor" } } },
    ]).toArray(),
  ]);
  const balances = await getAccountBalances(db, userId, accounts);
  const balanceSummary = [...new Set(accounts.map(account => account.currency))].map(currency => formatMoney(accounts.filter(account => account.currency === currency).reduce((total, account) => total + (balances.get(account._id!.toHexString()) ?? account.openingBalanceMinor), 0), currency, locale)).join(" · ") || "No accounts";
  const flowByKey = new Map(monthFlows.map(row => [`${row._id.type}:${row._id.currency}`, row.total]));
  const formatFlow = (type: "INCOME" | "EXPENSE") => [...new Set(monthFlows.filter(row => row._id.type === type).map(row => row._id.currency))].map(currency => formatMoney(flowByKey.get(`${type}:${currency}`) ?? 0, currency, locale)).join(" · ") || formatMoney(0, settings?.baseCurrency ?? "RWF", locale);
  const incomeCurrencies = new Set(monthFlows.filter(row => row._id.type === "INCOME" && row.total > 0).map(row => row._id.currency));
  const income = incomeCurrencies.size === 1 ? flowByKey.get(`INCOME:${[...incomeCurrencies][0]}`) ?? 0 : 0;
  const sameCurrencyExpense = incomeCurrencies.size === 1 ? flowByKey.get(`EXPENSE:${[...incomeCurrencies][0]}`) ?? 0 : 0;
  const savingsRate = income > 0 ? `${Math.round((income - sameCurrencyExpense) / income * 100)}%` : "—";
  const spendRows = await db.collection<TransactionDocument>("transactions").aggregate<{ _id: { categoryId: string | null; currency: string }; total: number }>([
    { $match: { userId, deletedAt: null, type: "EXPENSE", occurredAt: { $gte: monthStart, $lte: now } } },
    { $group: { _id: { categoryId: "$categoryId", currency: "$currency" }, total: { $sum: "$amountMinor" } } },
  ]).toArray();
  const spendByKey = new Map(spendRows.map(row => [`${row._id.categoryId ?? "uncategorized"}:${row._id.currency}`, row.total]));
  const categoryById = new Map(categories.map(category => [category._id!.toHexString(), category]));
  const spendByDate = new Map(weeklySpend.map(row => [row._id, row.total]));
  const weeklySpendPoints = Array.from({ length: 7 }, (_, offset) => { const date = new Date(`${startDay}T12:00:00.000Z`); date.setUTCDate(date.getUTCDate() + offset); const key = date.toISOString().slice(0, 10); return { label: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(date), value: spendByDate.get(key) ?? 0 }; });

  return <AppShell>
    <PageHeading title="Finance" description="Track cash flow, plan category spending, and keep savings and obligations visible." actions={<a href="/finance/import" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 text-xs font-semibold"><Plus size={15}/> Import mobile money</a>} />
    <div className="mb-5"><WeeklyBars title={`Daily spending · ${settings?.baseCurrency ?? "RWF"}`} description="Expenses over the last seven days in your base currency." points={weeklySpendPoints} valueLabel={settings?.baseCurrency ?? "RWF"}/></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatTile label="Account balances" value={balanceSummary} detail={`${accounts.length} accounts · by currency`} icon={Wallet}/><StatTile label="Income this month" value={formatFlow("INCOME")} detail={month} icon={ArrowDownLeft}/><StatTile label="Spending this month" value={formatFlow("EXPENSE")} detail={month} icon={CircleDollarSign}/><StatTile label="Savings rate" value={savingsRate} detail={income > 0 ? "Based on the single income currency" : "Add income to calculate"} icon={ShieldCheck}/></div>
    <div className="grid gap-4 xl:grid-cols-12">
      <Surface className="xl:col-span-7">
        <div className="mb-5 flex items-center justify-between"><div><p className="metric-label"><Wallet size={14}/> ACCOUNTS</p><h2 className="mt-1 font-display text-lg font-semibold">Cash position</h2></div><details className="relative"><summary className="icon-button size-9 cursor-pointer list-none"><Plus size={17}/></summary><div className="absolute right-0 z-10 mt-2 w-[min(86vw,340px)] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-5 shadow-2xl"><h3 className="mb-4 font-display text-base font-semibold">Add account</h3><ActionForm action={createAccountAction}><Field label="Account name" name="name" required/><Field label="Type" name="type"><select name="type" className="form-control"><option value="MOMO">Mobile money</option><option value="CASH">Cash</option><option value="BANK">Bank</option><option value="CARD">Card</option><option value="OTHER">Other</option></select></Field><Field label="Currency" name="currency"><select name="currency" className="form-control"><option>RWF</option><option>USD</option></select></Field><Field label="Opening balance (RWF francs or USD cents)" name="openingBalanceMinor" type="number" defaultValue="0"/></ActionForm></div></details></div>
        {accounts.length ? <div className="grid gap-3 sm:grid-cols-2">{accounts.map(account => <article key={account._id!.toHexString()} className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-4"><div className="flex items-center justify-between"><span className="text-xs text-[var(--muted)]">{account.name}</span><span className="rounded-full border border-[var(--border-strong)] px-2 py-0.5 font-mono text-[9px] text-[var(--muted)]">{account.type} / {account.currency}</span></div><p className="mt-3 font-display text-2xl font-semibold metric-number">{formatMoney(balances.get(account._id!.toHexString()) ?? account.openingBalanceMinor, account.currency, locale)}</p></article>)}</div> : <EmptyState icon={Wallet} title="No accounts connected" description="Add cash or mobile money to start tracking balances."/>}
      </Surface>
      <Surface className="xl:col-span-5">
        <div className="mb-5"><p className="metric-label"><CircleDollarSign size={14}/> FAST ENTRY</p><h2 className="mt-1 font-display text-lg font-semibold">Record a transaction</h2></div>
        {accounts.length ? <ActionForm action={createTransactionAction} submitLabel="Save transaction"><Field label="Account" name="accountId"><select name="accountId" required className="form-control">{accounts.map(account=><option key={account._id!.toHexString()} value={account._id!.toHexString()}>{account.name} · {account.currency}</option>)}</select></Field><Field label="Type" name="type"><select name="type" className="form-control"><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></Field><Field label="Category" name="categoryId"><select name="categoryId" className="form-control"><option value="">Uncategorized</option>{categories.map(category=><option key={category._id!.toHexString()} value={category._id!.toHexString()}>{category.name} ({category.kind.toLowerCase()})</option>)}</select></Field><Field label="Amount" name="amount" type="number" required/><Field label="Date" name="occurredAt" type="date"/><Field label="Note" name="note"/></ActionForm> : <p className="text-sm text-[var(--muted)]">Create an account before entering transactions.</p>}
      </Surface>

      <Surface className="xl:col-span-7">
        <div className="mb-5 flex items-center justify-between"><div><p className="metric-label"><Target size={14}/> SPENDING PLAN</p><h2 className="mt-1 font-display text-lg font-semibold">Budgets <span className="text-sm font-normal text-[var(--muted)]">{month}</span></h2></div><details className="relative"><summary className="rounded-lg border border-[var(--border-strong)] px-3 py-2 text-xs font-semibold">New budget</summary><div className="absolute right-0 z-10 mt-2 w-[min(86vw,340px)] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-5 shadow-2xl"><ActionForm action={createBudgetAction}><Field label="Expense category" name="categoryId"><select name="categoryId" required className="form-control">{categories.filter(category=>category.kind==="EXPENSE").map(category=><option key={category._id!.toHexString()} value={category._id!.toHexString()}>{category.name}</option>)}</select></Field><Field label="Month" name="month" type="month" defaultValue={month}/><Field label="Limit" name="amount" type="number" required/><Field label="Currency" name="currency"><select name="currency" className="form-control"><option>RWF</option><option>USD</option></select></Field></ActionForm></div></details></div>
        {budgets.length ? <div className="space-y-4">{budgets.map(budget=>{const category=categoryById.get(budget.categoryId.toHexString());const spent=spendByKey.get(`${budget.categoryId.toHexString()}:${budget.currency}`)??0;const percent=Math.min(100,Math.round(spent/budget.amountMinor*100));const tone=percent>=90?"danger":percent>=70?"warning":"success";return <div key={budget._id!.toHexString()}><div className="mb-2 flex justify-between gap-3 text-xs"><span className="font-medium">{category?.name??"Deleted category"}</span><span className="font-mono text-[var(--muted)]">{formatMoney(spent,budget.currency,locale)} / {formatMoney(budget.amountMinor,budget.currency,locale)}</span></div><div className="h-2 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-3)]"><div className={`h-full rounded-full ${tone==="danger"?"bg-[var(--danger)]":tone==="warning"?"bg-[var(--warning)]":"bg-[var(--success)]"}`} style={{width:`${percent}%`}}/></div><p className={`mt-1 text-right text-[10px] ${tone==="danger"?"text-[var(--danger)]":tone==="warning"?"text-[var(--warning)]":"text-[var(--muted)]"}`}>{percent}% used</p></div>})}</div> : <EmptyState icon={Target} title="No budgets for this month" description="Set category limits to see spending progress here."/>}
        <details className="mt-5 border-t border-[var(--border-strong)] pt-4"><summary className="cursor-pointer text-xs font-semibold text-[var(--strawberry)]">Manage expense categories</summary><div className="mt-4"><ActionForm action={createCategoryAction}><Field label="Category name" name="name" required/><Field label="Type" name="kind"><select name="kind" className="form-control"><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></Field></ActionForm></div></details>
      </Surface>

      <Surface className="xl:col-span-5">
        <div className="mb-5 flex items-center justify-between"><div><p className="metric-label"><ShieldCheck size={14}/> FUTURE YOU</p><h2 className="mt-1 font-display text-lg font-semibold">Savings goals</h2></div><details className="relative"><summary className="icon-button size-9 cursor-pointer list-none"><Plus size={17}/></summary><div className="absolute right-0 z-10 mt-2 w-[min(86vw,340px)] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-5 shadow-2xl"><ActionForm action={createSavingsGoalAction}><Field label="Goal name" name="name" required/><Field label="Target amount" name="target" type="number" required/><Field label="Already saved" name="current" type="number" defaultValue="0"/><Field label="Currency" name="currency"><select name="currency" className="form-control"><option>RWF</option><option>USD</option></select></Field><Field label="Target date" name="deadline" type="date"/><Field label="Emergency fund" name="isEmergencyFund"><select name="isEmergencyFund" className="form-control"><option value="false">No</option><option value="true">Yes</option></select></Field></ActionForm></div></details></div>
        {savings.length ? <div className="space-y-4">{savings.map(goal=>{const percent=Math.min(100,Math.round(goal.currentMinor/goal.targetMinor*100));return <div key={goal._id!.toHexString()} className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-4"><div className="flex justify-between gap-3"><p className="text-sm font-medium">{goal.name}</p>{goal.isEmergencyFund&&<ShieldCheck size={15} className="text-[var(--success)]"/>}</div><div className="mt-3 flex justify-between text-[10px] text-[var(--muted)]"><span>{formatMoney(goal.currentMinor,goal.currency,locale)}</span><span>{formatMoney(goal.targetMinor,goal.currency,locale)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-[var(--strawberry)]" style={{width:`${percent}%`}}/></div></div>})}</div> : <EmptyState icon={ShieldCheck} title="Start a savings goal" description="Track an emergency fund or save for something specific."/>}
      </Surface>

      <Surface className="xl:col-span-5">
        <div className="mb-5 flex items-center justify-between"><div><p className="metric-label"><Scale size={14}/> OBLIGATIONS</p><h2 className="mt-1 font-display text-lg font-semibold">Debts and receivables</h2></div><details className="relative"><summary className="icon-button size-9 cursor-pointer list-none"><Plus size={17}/></summary><div className="absolute right-0 z-10 mt-2 w-[min(86vw,340px)] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-5 shadow-2xl"><ActionForm action={createDebtAction}><Field label="Direction" name="direction"><select name="direction" className="form-control"><option value="OWED_BY_ME">I owe</option><option value="OWED_TO_ME">Owed to me</option></select></Field><Field label="Person or organization" name="party" required/><Field label="Original amount" name="principal" type="number" required/><Field label="Remaining balance" name="balance" type="number" required/><Field label="Currency" name="currency"><select name="currency" className="form-control"><option>RWF</option><option>USD</option></select></Field><Field label="Due date" name="dueDate" type="date"/></ActionForm></div></details></div>
        {debts.length ? <div className="space-y-3">{debts.map(debt=><div key={debt._id!.toHexString()} className="flex items-center gap-3 rounded-xl border border-[var(--border-strong)] p-3"><span className={`grid size-9 place-items-center rounded-lg ${debt.direction==="OWED_BY_ME"?"bg-[color-mix(in_srgb,var(--danger),transparent_85%)] text-[var(--danger)]":"bg-[color-mix(in_srgb,var(--success),transparent_85%)] text-[var(--success)]"}`}>{debt.direction==="OWED_BY_ME"?<ArrowUpRight size={16}/>:<ArrowDownLeft size={16}/>}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{debt.party}</p><p className="text-[10px] text-[var(--muted)]">{debt.direction==="OWED_BY_ME"?"You owe":"Owed to you"}</p></div><p className="font-mono text-xs">{formatMoney(debt.balanceMinor,debt.currency,locale)}</p></div>)}</div> : <EmptyState icon={Scale} title="No open balances" description="Track what you owe and what others owe you."/>}
      </Surface>

      <Surface className="xl:col-span-7">
        <div className="mb-4"><p className="metric-label"><CircleDollarSign size={14}/> LEDGER</p><h2 className="mt-1 font-display text-lg font-semibold">Recent transactions</h2></div>
        {transactions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-[var(--border-strong)] text-[var(--muted)]"><tr><th className="pb-3 font-medium">Transaction</th><th className="pb-3 font-medium">Category</th><th className="pb-3 font-medium">Date</th><th className="pb-3 text-right font-medium">Amount</th><th className="pb-3 text-right font-medium">Manage</th></tr></thead>
              <tbody>{transactions.map(tx => {
                const transactionId = tx._id!.toHexString();
                return <tr key={transactionId} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3">{tx.note || tx.type}</td>
                  <td className="py-3 text-[var(--muted)]">{tx.categoryId ? categoryById.get(tx.categoryId.toHexString())?.name ?? "Other" : "Uncategorized"}</td>
                  <td className="py-3 text-[var(--muted)]">{tx.occurredAt.toLocaleDateString(locale, { timeZone: timezone })}</td>
                  <td className={`py-3 text-right font-mono ${tx.type === "EXPENSE" ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>{tx.type === "EXPENSE" ? "−" : "+"}{formatMoney(tx.amountMinor, tx.currency, locale)}</td>
                  <td className="py-2"><div className="flex items-center justify-end gap-1">
                    {tx.type !== "TRANSFER" && <details className="relative"><summary className="grid size-8 cursor-pointer list-none place-items-center rounded-lg px-1 text-[10px] text-[var(--muted)] hover:bg-[var(--surface-2)]">Edit</summary><div className="absolute right-0 z-20 mt-2 w-[min(88vw,360px)] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-1)] p-4 shadow-xl"><ActionForm action={updateTransactionAction.bind(null, transactionId)} submitLabel="Save transaction"><Field label="Account" name="accountId"><select name="accountId" defaultValue={tx.accountId.toHexString()}>{accounts.map(account => <option key={account._id!.toHexString()} value={account._id!.toHexString()}>{account.name} · {account.currency}</option>)}</select></Field><Field label="Type" name="type"><select name="type" defaultValue={tx.type}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></Field><Field label="Category" name="categoryId"><select name="categoryId" defaultValue={tx.categoryId?.toHexString() ?? ""}><option value="">Uncategorized</option>{categories.map(category => <option key={category._id!.toHexString()} value={category._id!.toHexString()}>{category.name} ({category.kind.toLowerCase()})</option>)}</select></Field><Field label="Amount" name="amount" type="number" required defaultValue={String(fromMinor(tx.amountMinor, tx.currency))}/><Field label="Date" name="occurredAt" type="date" defaultValue={localDateKey(tx.occurredAt, timezone)}/><Field label="Note" name="note" defaultValue={tx.note}/></ActionForm></div></details>}
                    <TransactionDeleteButton transactionId={transactionId}/>
                  </div></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        ) : <EmptyState icon={CircleDollarSign} title="No transactions yet" description="Your financial activity will show here after your first entry."/>}
      </Surface>
    </div>
  </AppShell>;
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof Wallet; title: string; description: string }) { return <div className="grid min-h-28 place-content-center justify-items-center rounded-xl border border-dashed border-[var(--border-strong)] px-4 py-5 text-center"><Icon size={20} className="mb-2 text-[var(--muted)]"/><p className="text-xs font-semibold">{title}</p><p className="mt-1 max-w-xs text-[10px] leading-4 text-[var(--muted)]">{description}</p></div>; }
