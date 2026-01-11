import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./pages/Auth";

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import Debts from "./pages/Debts";

/* ===============================
   Utilidad: estado en localStorage
================================ */
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
    } catch {}
  }, [key, state]);

  return [state, setState];
}

/* ===============================
   Defaults
================================ */
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
  {
    id: crypto.randomUUID(),
    name: "Efectivo",
    initialBalance: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  },
];

/* ===============================
   APP
================================ */
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------- Navegación -------- */
  const [view, setView] = useState("home");
  // home | categories | accounts | income | expense | debts

  /* -------- Persistencia -------- */
  const [accounts, setAccounts] = useLocalStorageState("esfera_accounts_v1", DEFAULT_ACCOUNTS);
  const [categories, setCategories] = useLocalStorageState("esfera_categories_v1", DEFAULT_CATEGORIES);
  const [txns, setTxns] = useLocalStorageState("esfera_txns_v1", []);
  const [debts, setDebts] = useLocalStorageState("esfera_debts_v1", []);

  /* -------- Mes / Año -------- */
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  /* -------- Auth -------- */
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ===============================
     Balances (GLOBAL, sin filtro de mes)
  ================================ */
  const computedAccountBalances = useMemo(() => {
    const map = new Map();
    accounts.forEach((a) => map.set(a.id, Number(a.initialBalance || 0)));

    txns.forEach((t) => {
      if (!map.has(t.accountId)) return;
      const prev = map.get(t.accountId) || 0;
      const amt = Number(t.amount || 0);
      if (t.type === "income") map.set(t.accountId, prev + amt);
      if (t.type === "expense") map.set(t.accountId, prev - amt);
    });

    return map;
  }, [accounts, txns]);

  const totalFunds = useMemo(() => {
    let sum = 0;
    accounts.forEach((a) => {
      sum += computedAccountBalances.get(a.id) || 0;
    });
    return sum;
  }, [accounts, computedAccountBalances]);

  /* ===============================
     Acciones
  ================================ */
  function addTxn(txn) {
    setTxns((prev) => [
      {
        id: crypto.randomUUID(),
        ...txn,
        amount: Number(txn.amount || 0),
        description: (txn.description || "").trim(),
        categoryId: txn.categoryId || "",
      },
      ...prev,
    ]);
  }

  function deleteTxn(txnId) {
    setTxns((prev) => prev.filter((t) => t.id !== txnId));
  }

  /* ===============================
     Auth Gate
  ================================ */
  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Cargando...</p>;
  }

  if (!session) {
    return <Auth />;
  }

  /* ===============================
     Navegación
  ================================ */
  const nav = {
    goHome: () => setView("home"),
    goCategories: () => setView("categories"),
    goAccounts: () => setView("accounts"),
    goIncome: () => setView("income"),
    goExpense: () => setView("expense"),
    goDebts: () => setView("debts"),
  };

  /* ===============================
     Render por vista
  ================================ */
  if (view === "categories") {
    return (
      <Categories
        goBack={nav.goHome}
        categories={categories}
        setCategories={setCategories}
        txns={txns}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />
    );
  }

  if (view === "accounts") {
    return (
      <Accounts
        goBack={nav.goHome}
        accounts={accounts}
        balancesMap={computedAccountBalances}
        setAccounts={setAccounts}
      />
    );
  }

  if (view === "income") {
    return (
      <Income
        goBack={nav.goHome}
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
        goBack={nav.goHome}
        accounts={accounts}
        categories={categories}
        addTxn={addTxn}
        deleteTxn={deleteTxn}
        txns={txns}
      />
    );
  }

  if (view === "debts") {
    return (
      <Debts
        goBack={nav.goHome}
        debts={debts}
        setDebts={setDebts}
        addTxn={addTxn}
        txns={txns}
        accounts={accounts}
        categories={categories}
      />
    );
  }

  /* ===============================
     HOME
  ================================ */
  return (
    <Home
      onGoAccounts={nav.goAccounts}
      onGoCategories={nav.goCategories}
      onGoDebts={nav.goDebts}
      onGoIncome={nav.goIncome}
      onGoExpense={nav.goExpense}
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
