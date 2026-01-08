import FunnelNivel from "../components/FunnelNivel";
import PieGastos from "../components/PieGastos";

function money(n) {
  return (Number(n || 0)).toLocaleString("es-CO");
}

function toMonthKey(dateStr) {
  // dateStr: YYYY-MM-DD
  const [y, m] = dateStr.split("-").map(Number);
  return { y, m };
}

function levelFromCoverageMonths(months) {
  if (!isFinite(months) || months <= 0) return { level: 0, label: "Vulnerable", range: "0 a <1 mes" };
  if (months < 1) return { level: 0, label: "Vulnerable", range: "0 a <1 mes" };
  if (months < 3) return { level: 1, label: "Inestable", range: "1 a <3 meses" };
  if (months < 6) return { level: 2, label: "Equilibrado", range: "3 a <6 meses" };
  if (months < 12) return { level: 3, label: "Preparado", range: "6 a <12 meses" };
  if (months < 24) return { level: 4, label: "Estratégico", range: "12 a <24 meses" };
  return { level: 5, label: "Libre", range: "24+ meses" };
}

export default function Home({
  onGoAccounts,
  onGoCategories,
  onGoIncome,
  onGoExpense,
  accounts,
  balancesMap,
  categories,
  txns,
  totalFunds,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
}) {
  // Filtrar movimientos por mes
  const txnsThisMonth = txns.filter((t) => {
    if (!t.date) return false;
    const { y, m } = toMonthKey(t.date);
    return y === Number(selectedYear) && m === Number(selectedMonth);
  });

  const incomeThisMonth = txnsThisMonth
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expenseThisMonth = txnsThisMonth
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Gasto total del mes (esencial + no esencial)
const totalExpenseThisMonth = txnsThisMonth
  .filter((t) => t.type === "expense")
  .reduce((sum, t) => sum + Number(t.amount || 0), 0);

// Para análisis secundario (se mantiene)
const essentialCategoryIds = new Set(
  categories.filter((c) => c.essential).map((c) => c.id)
);

const essentialExpenseThisMonth = txnsThisMonth
  .filter((t) => t.type === "expense" && essentialCategoryIds.has(t.categoryId))
  .reduce((sum, t) => sum + Number(t.amount || 0), 0);

const nonEssentialExpenseThisMonth =
  Math.max(0, totalExpenseThisMonth - essentialExpenseThisMonth);
const savingsThisMonth = Math.max(0, incomeThisMonth - totalExpenseThisMonth);


// Meses de cobertura REAL
const coverageMonths =
  totalExpenseThisMonth > 0
    ? totalFunds / totalExpenseThisMonth
    : 0;
  
  const lvl = levelFromCoverageMonths(coverageMonths);

  // Mensaje (sin revelar % del libro)
  const strategy = lvl.level <= 1 ? "Escudo" : lvl.level === 2 ? "Estabilización" : lvl.level === 3 ? "Optimización" : "Soberanía";
  const strategyText =
    lvl.level <= 1
      ? "Para salir de este nivel, aplica la estrategia Escudo descrita en el Método ESFERA."
      : "Para seguir avanzando, revisa la estrategia recomendada en el Método ESFERA.";

  // Presupuesto vs Real por categoría (solo gasto)
  const budgetByCat = categories.reduce((acc, c) => {
    const pct = Number(c.percent || 0);
    const budget = (incomeThisMonth * pct) / 100;
    acc[c.id] = budget;
    return acc;
  }, {});

  const realByCat = txnsThisMonth
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const topCats = categories
    .filter((c) => c.type !== "Ingreso")
    .map((c) => ({
      id: c.id,
      name: c.name,
      essential: c.essential,
      budget: budgetByCat[c.id] || 0,
      real: realByCat[c.id] || 0,
    }))
    .filter((x) => x.budget > 0 || x.real > 0)
    .sort((a, b) => (b.real || 0) - (a.real || 0))
    .slice(0, 6);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>ESFERA</h1>
            <p style={styles.subtitle}>Control financiero personal</p>
          </div>

          <div style={styles.filters}>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} style={styles.select}>
              {Array.from({ length: 12 }).map((_, i) => {
                const m = i + 1;
                return (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                );
              })}
            </select>

            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={styles.year}
              min={2000}
              max={2100}
            />
          </div>
        </header>

        <section style={styles.grid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Nivel financiero</h2>
            <div style={styles.levelRow}>
              <div style={styles.levelBig}>
                Nivel {lvl.level} · {lvl.label}
              </div>
              <div style={styles.levelMeta}>
                Cobertura: <strong>{coverageMonths ? coverageMonths.toFixed(1) : "0.0"}</strong> meses (esencial)
              </div>
            </div>
            <p style={styles.muted}>{strategyText}</p>
            <div style={styles.badge}>Estrategia: {strategy}</div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Fondo disponible</h2>
            <div style={styles.money}>$ {money(totalFunds)}</div>
            <p style={styles.muted}>Saldo total en todas tus cuentas</p>

            <div style={styles.accountsMini}>
              {accounts.map((a) => (
                <div key={a.id} style={styles.accountChip}>
                  <div style={{ fontWeight: 700 }}>{a.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Inicial: $ {money(a.initialBalance)}</div>
                  <div style={{ marginTop: 4 }}>Actual: $ {money(balancesMap.get(a.id) || 0)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Resumen del mes</h2>
            <div style={styles.kpis}>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>Ingresos</div>
                <div style={styles.kpiValue}>$ {money(incomeThisMonth)}</div>
              </div>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>Gastos</div>
                <div style={styles.kpiValue}>$ {money(expenseThisMonth)}</div>
              </div>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>Esenciales</div>
                <div style={styles.kpiValue}>$ {money(essentialExpenseThisMonth)}</div>
              </div>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>No esenciales</div>
                <div style={styles.kpiValue}>$ {money(nonEssentialExpenseThisMonth)}</div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Presupuesto vs Real (Top)</h2>
            {topCats.length === 0 ? (
              <p style={styles.muted}>Aún no hay datos suficientes en este mes. Registra ingresos, define % en Categorías y registra gastos.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {topCats.map((c) => {
                  const ratio = c.budget > 0 ? Math.min(1, c.real / c.budget) : 0;
                  return (
                    <div key={c.id} style={styles.row}>
                      <div style={{ minWidth: 160 }}>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{c.essential ? "Esencial" : "No esencial"}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.barTrack}>
                          <div style={{ ...styles.barFill, width: `${ratio * 100}%` }} />
                        </div>
                        <div style={styles.rowMeta}>
                          Presupuesto: $ {money(c.budget)} · Real: $ {money(c.real)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Embudo (imagen del libro): opcional.
            Si quieres verlo aquí, guarda tu imagen como:
            public/embudo-esfera.png
            y descomenta el bloque. */}
        {/*
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Embudo de niveles</h2>
          <img src="/embudo-esfera.png" alt="Embudo ESFERA" style={{ width: "100%", maxWidth: 900 }} />
        </section>
        */}

        <section style={styles.actions}>
          <button style={styles.btnSecondary} onClick={onGoAccounts}>Cuentas</button>
          <button style={styles.btnSecondary} onClick={onGoCategories}>Categorías</button>
          <button style={styles.btnPrimary} onClick={onGoIncome}>Registrar ingreso</button>
          <button style={styles.btnPrimary} onClick={onGoExpense}>Registrar gasto</button>
        </section>
{/* ===================== */}
{/* VISUALES ESTRATÉGICOS */}
{/* ===================== */}

<section style={{ marginTop: 28 }}>
  <div style={styles.card}>
    <FunnelNivel nivelActual={lvl.level} />
  </div>

  <div style={{ ...styles.card, marginTop: 16 }}>
    <PieGastos
      esenciales={essentialExpenseThisMonth}
      noEsenciales={nonEssentialExpenseThisMonth}
      ahorro={savingsThisMonth}
    />
  </div>
</section>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    padding: "28px 16px",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-end",
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 52,
    letterSpacing: 1,
    color: "#102a43",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#334e68",
    fontSize: 16,
  },
  filters: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d9e2ec",
    background: "white",
  },
  year: {
    width: 90,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d9e2ec",
    background: "white",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 16,
  },
  card: {
    background: "white",
    border: "1px solid #e6edf5",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 8px 20px rgba(16,42,67,0.06)",
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    color: "#102a43",
    letterSpacing: 0.3,
  },
  levelRow: {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  levelBig: {
    fontSize: 26,
    fontWeight: 800,
    color: "#102a43",
  },
  levelMeta: {
    color: "#334e68",
    alignSelf: "center",
  },
  badge: {
    display: "inline-block",
    marginTop: 10,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#edf2ff",
    border: "1px solid #dbe4ff",
    color: "#364fc7",
    fontWeight: 700,
    fontSize: 12,
  },
  money: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: 900,
    color: "#102a43",
  },
  muted: {
    marginTop: 8,
    color: "#52606d",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 18,
  },
  btnPrimary: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #bcccdc",
    background: "#102a43",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #bcccdc",
    background: "white",
    color: "#102a43",
    fontWeight: 800,
    cursor: "pointer",
  },
  accountsMini: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 12,
  },
  accountChip: {
    border: "1px solid #e6edf5",
    borderRadius: 12,
    padding: 10,
    background: "#fbfdff",
  },
  kpis: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  kpi: {
    border: "1px solid #e6edf5",
    borderRadius: 12,
    padding: 12,
    background: "#fbfdff",
  },
  kpiLabel: {
    fontSize: 12,
    color: "#52606d",
    fontWeight: 700,
  },
  kpiValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: 900,
    color: "#102a43",
  },
  row: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    background: "#e6edf5",
    overflow: "hidden",
  },
  barFill: {
    height: 10,
    borderRadius: 999,
    background: "#6c8ef2",
  },
  rowMeta: {
    marginTop: 6,
    fontSize: 12,
    color: "#52606d",
  },
};
