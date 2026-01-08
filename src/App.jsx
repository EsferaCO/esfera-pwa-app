import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./pages/Auth";

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Income from "./pages/Income";
import Expense from "./pages/Expense";

/** ---------------------------
 *  Utilidad: localStorage state
 * --------------------------- */
function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState];
}

/** ---------------------------
 *  Defaults (sin % precargados)
 * --------------------------- */
const DEFAULT_CATEGORIES = [
  { id: crypto.randomUUID(), name: "Ingresos", type: "Ingreso", percent: "", essential: false },
  { id: crypto.randomUUID(), name: "Vivienda", type: "Gasto fijo", percent: "", essential: true },
  { id: crypto.randomUUID(), name: "Alimentación", type: "Gasto variable", percent: "", essential: true },
  { id: crypto.randomUUID(), name: "Servicios públicos", type: "Gasto fijo", percent: "", essential: true },
  { id: crypto.randomUUID(), name: "Transporte", type: "Gasto variable", percent: "", essential: true },
  { id: crypto.randomUUID(), name: "Salud", type: "Gasto fijo", percent: "", essential: true },
  { id: crypto.randomUUID(), name: "Gastos personales y vestuario", type: "Gasto variable", percent: "", essential: false },
  { id: crypto.randomUUID(), name: "Educación y desarrollo", type: "Ahorro / Inversión", percent: "", essential: false },
  { id: crypto.randomUUID(), name: "Entretenimiento y ocio", type: "Gasto variable", percent: "", essential: false },
  { id: crypto.randomUUID(), name: "Deudas financieras", type: "Gasto fijo", percent: "", essential: true },
  { id: crypto.randomUUID(), name: "Seguros y protección", type: "Gasto fijo", percent: "", essential: true },
  { id: crypto.randomUUID(), name: "Inversión", type: "Ahorro / Inversión", percent: "", essential: false },
  { id: crypto.randomUUID(), name: "Fondo de emergencia", type: "Ahorro", percent: "", essential: false },
];

const DEFAULT_ACCOUNTS = [
  { id: crypto.randomUUID(), name: "Efectivo", initialBalance: 0, createdAt: new Date().toISOString().slice(0, 10) },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // App pages (sin react-router por ahora)
  const [view, setView] = useState("home"); // home | categories | accounts | income | expense

  // Persistencia local
  const [accounts, setAccounts] = useLocalStorageState("esfera_accounts_v1", DEFAULT_ACCOUNTS);
  const [categories, setCategories] = useLocalStorageState("esfera_categories_v1", DEFAULT_CATEGORIES);
  const [txns, setTxns] = useLocalStorageState("esfera_txns_v1", []); // {id,date,type,amount,accountId,categoryId?,description?}

  // Mes/Año global de análisis (Home)
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1..12

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** ---------------------------
   *  Derivados (balances, etc.)
   * --------------------------- */
  const computedAccountBalances = useMemo(() => {
    const map = new Map();
    for (const a of accounts) map.set(a.id, Number(a.initialBalance || 0));

    for (const t of txns) {
      if (!map.has(t.accountId)) continue;
      const prev = map.get(t.accountId) || 0;
      const amt = Number(t.amount || 0);
      if (t.type === "income") map.set(t.accountId, prev + amt);
      if (t.type === "expense") map.set(t.accountId, prev - amt);
    }
    return map;
  }, [accounts, txns]);

  const totalFunds = useMemo(() => {
    let sum = 0;
    for (const a of accounts) {
      sum += computedAccountBalances.get(a.id) || 0;
    }
    return sum;
  }, [accounts, computedAccountBalances]);

  /** ---------------------------
   *  Acciones (CRUD)
   * --------------------------- */
  function addAccount({ name, initialBalance, createdAt }) {
    const next = [
      ...accounts,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        initialBalance: Number(initialBalance || 0),
        createdAt: createdAt || new Date().toISOString().slice(0, 10),
      },
    ];
    setAccounts(next);
  }

  function deleteAccount(accountId) {
    // Si hay movimientos asociados, NO borramos silenciosamente. Los eliminamos también para mantener consistencia.
    const nextAccounts = accounts.filter((a) => a.id !== accountId);
    const nextTxns = txns.filter((t) => t.accountId !== accountId);
    setAccounts(nextAccounts);
    setTxns(nextTxns);
  }

  function addCategory({ name, type }) {
    const trimmed = (name || "").trim();
    if (!trimmed) return;

    // Evitar duplicados exactos por nombre
    const exists = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;

    setCategories([
      ...categories,
      {
        id: crypto.randomUUID(),
        name: trimmed,
        type: type || "Gasto variable",
        percent: "",
        essential: false,
      },
    ]);
  }

  function deleteCategory(categoryId) {
    const nextCats = categories.filter((c) => c.id !== categoryId);
    const nextTxns = txns.map((t) => (t.categoryId === categoryId ? { ...t, categoryId: "" } : t));
    setCategories(nextCats);
    setTxns(nextTxns);
  }

  function updateCategory(categoryId, patch) {
    setCategories(categories.map((c) => (c.id === categoryId ? { ...c, ...patch } : c)));
  }

  function addTxn(txn) {
    // txn: {date,type,amount,accountId,categoryId?,description?}
    setTxns([
      {
        id: crypto.randomUUID(),
        date: txn.date,
        type: txn.type,
        amount: Number(txn.amount || 0),
        accountId: txn.accountId,
        categoryId: txn.categoryId || "",
        description: (txn.description || "").trim(),
      },
      ...txns,
    ]);
  }

  function deleteTxn(txnId) {
    setTxns(txns.filter((t) => t.id !== txnId));
  }

  /** ---------------------------
   *  Auth gating
   * --------------------------- */
  if (loading) return <p style={{ textAlign: "center" }}>Cargando...</p>;
  if (!session) return <Auth />;

  /** ---------------------------
   *  Render por vista
   * --------------------------- */
  const commonNav = {
    goHome: () => setView("home"),
    goCategories: () => setView("categories"),
    goAccounts: () => setView("accounts"),
    goIncome: () => setView("income"),
    goExpense: () => setView("expense"),
  };

  if (view === "categories") {
    return (
      <Categories
        goBack={commonNav.goHome}
        categories={categories}
        addCategory={addCategory}
        deleteCategory={deleteCategory}
        updateCategory={updateCategory}
        // presupuesto se calcula con ingresos del mes filtrado (no un fijo)
        txns={txns}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />
    );
  }

  if (view === "accounts") {
    return (
      <Accounts
        goBack={commonNav.goHome}
        accounts={accounts}
        balancesMap={computedAccountBalances}
        addAccount={addAccount}
        deleteAccount={deleteAccount}
      />
    );
  }

  if (view === "income") {
    return (
      <Income
        goBack={commonNav.goHome}
        accounts={accounts}
        addTxn={addTxn}
        deleteTxn={deleteTxn}
        txns={txns}
      />
    );
  }

  if (view === "expense") {
    return (
      <Expense
        goBack={commonNav.goHome}
        accounts={accounts}
        categories={categories}
        addTxn={addTxn}
        deleteTxn={deleteTxn}
        txns={txns}
      />
    );
  }

  // default: home
  return (
    <Home
      onGoAccounts={commonNav.goAccounts}
      onGoCategories={commonNav.goCategories}
      onGoIncome={commonNav.goIncome}
      onGoExpense={commonNav.goExpense}
      accounts={accounts}
      balancesMap={computedAccountBalances}
      categories={categories}
      txns={txns}
      totalFunds={totalFunds}
      selectedYear={selectedYear}
      setSelectedYear={setSelectedYear}
      selectedMonth={selectedMonth}
      setSelectedMonth={setSelectedMonth}
    />
  );
}
