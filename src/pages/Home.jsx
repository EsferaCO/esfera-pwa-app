import FunnelNivel from "../components/FunnelNivel";
import PieGastos from "../components/PieGastos";

function money(n) {
  return (Number(n || 0)).toLocaleString("es-CO");
}

function toMonthKey(dateStr) {
  if (!dateStr) return { y: 0, m: 0 };
  const [y, m] = dateStr.split("-").map(Number);
  return { y, m };
}

function levelFromCoverageMonths(months) {
  if (!isFinite(months) || months <= 0) return { level: 0, label: "Vulnerable" };
  if (months < 1) return { level: 0, label: "Vulnerable" };
  if (months < 3) return { level: 1, label: "Inestable" };
  if (months < 6) return { level: 2, label: "Equilibrado" };
  if (months < 12) return { level: 3, label: "Preparado" };
  if (months < 24) return { level: 4, label: "Estratégico" };
  return { level: 5, label: "Libre" };
}

export default function Home({
  onGoAccounts,
  onGoCategories,
  onGoIncome,
  onGoExpense,
  onGoDebts,
  accounts = [],
  categories = [],
  txns = [],
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
}) {
  
  // --- 1. FONDO ACUMULADO (ARRASTRE REAL) ---
  const cumulativeBalance = accounts.reduce((total, acc) => {
    const initial = Number(acc.initialBalance || 0);
    const history = txns.filter(t => {
      if (t.accountId !== acc.id) return false;
      const { y, m } = toMonthKey(t.date);
      return y < Number(selectedYear) || (y === Number(selectedYear) && m <= Number(selectedMonth));
    });
    const balanceDelta = history.reduce((sum, t) => t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount), 0);
    return total + (initial + balanceDelta);
  }, 0);

  // --- 2. GASTOS DEL MES ACTUAL ---
  const txnsThisMonth = txns.filter((t) => {
    const { y, m } = toMonthKey(t.date);
    return y === Number(selectedYear) && m === Number(selectedMonth);
  });

  const incomeThisMonth = txnsThisMonth.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
  const expenseThisMonth = txnsThisMonth.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);

  // --- 3. LÓGICA DE COBERTURA INTELIGENTE ---
  // Si en el mes actual no hay gastos, buscamos el promedio histórico para que el nivel no sea 0
  const allExpenses = txns.filter(t => t.type === "expense");
  const avgMonthlyExpense = allExpenses.length > 0 
    ? allExpenses.reduce((s, t) => s + Number(t.amount), 0) / (new Set(allExpenses.map(t => t.date.substring(0,7))).size || 1)
    : 0;

  // Usamos el gasto de este mes, pero si es 0, usamos el promedio para calcular libertad financiera
  const costOfLiving = expenseThisMonth > 0 ? expenseThisMonth : avgMonthlyExpense;
  
  const coverageMonths = costOfLiving > 0 ? cumulativeBalance / costOfLiving : 0;
  const lvl = levelFromCoverageMonths(coverageMonths);

  // --- 4. PREPARACIÓN DE TABLA PPTO VS REAL (MANTENIDA) ---
  const tableData = categories
    .filter((c) => c.type !== "Ingreso")
    .map((c) => {
      const budget = (incomeThisMonth * Number(c.percent || 0)) / 100;
      const real = txnsThisMonth.filter(t => t.type === "expense" && t.categoryId === c.id).reduce((s, t) => s + Number(t.amount || 0), 0);
      return { ...c, budget, real, pct: budget > 0 ? (real / budget) * 100 : 0 };
    })
    .filter(x => x.budget > 0 || x.real > 0)
    .sort((a, b) => b.real - a.real);

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
              {Array.from({ length: 12 }).map((_, i) => (<option key={i+1} value={i+1}>{String(i+1).padStart(2, "0")}</option>))}
            </select>
            <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={styles.year} />
          </div>
        </header>

        <section style={styles.grid}>
          {/* NIVEL FINANCIERO Y FUNNEL ASOCIADO */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Nivel financiero</h2>
            <div style={styles.levelRow}>
              <div style={styles.levelBig}>Nivel {lvl.level} · {lvl.label}</div>
              <div style={styles.levelMeta}>Cobertura: <strong>{coverageMonths.toFixed(1)}</strong> meses</div>
            </div>
            
            {/* El componente FunnelNivel ahora recibe el nivel real y DEBE pintarse/seleccionarse internamente */}
            <div style={{ marginTop: 20 }}>
               <FunnelNivel nivelActual={lvl.level} />
            </div>
            
            <div style={{...styles.badge, marginTop: 20}}>
              Estrategia: {lvl.level <= 1 ? "Escudo" : lvl.level === 2 ? "Estabilización" : lvl.level <= 4 ? "Optimización" : "Soberanía"}
            </div>
          </div>

          {/* FONDO Y GRÁFICA DE GASTOS */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Fondo Disponible Acumulado</h2>
            <div style={styles.money}>$ {money(cumulativeBalance)}</div>
            <p style={styles.muted}>Saldo total al cierre de {selectedMonth}/{selectedYear}</p>
            
            <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #f0f4f8' }} />
            
            <h3 style={{ fontSize: 14, color: '#102a43', marginBottom: 15 }}>Distribución de Gastos (Mes)</h3>
            <div style={{ height: 200 }}>
              <PieGastos 
                esenciales={txnsThisMonth.filter(t => t.type === "expense" && categories.find(c => c.id === t.categoryId)?.essential).reduce((s,t)=>s+Number(t.amount),0)}
                noEsenciales={txnsThisMonth.filter(t => t.type === "expense" && !categories.find(c => c.id === t.categoryId)?.essential).reduce((s,t)=>s+Number(t.amount),0)}
                ahorro={Math.max(0, incomeThisMonth - expenseThisMonth)}
              />
            </div>
          </div>
        </section>

        {/* TABLA DE CUMPLIMIENTO PROFESIONAL */}
        <section style={{ marginTop: 16 }}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Presupuesto vs Ejecución</h2>
            <div style={{ overflowX: 'auto', marginTop: 15 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f4f8', textAlign: 'left' }}>
                    <th style={styles.th}>Categoría</th>
                    <th style={styles.th}>Ppto</th>
                    <th style={styles.th}>Real</th>
                    <th style={styles.th}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                      <td style={styles.td}><strong>{row.name}</strong></td>
                      <td style={styles.td}>$ {money(row.budget)}</td>
                      <td style={styles.td}>$ {money(row.real)}</td>
                      <td style={{ ...styles.td, color: row.pct > 100 ? '#ef4444' : '#10b981', fontWeight: '800' }}>
                        {row.pct.toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section style={styles.actions}>
          <button style={styles.btnSecondary} onClick={onGoAccounts}>Cuentas</button>
          <button style={styles.btnSecondary} onClick={onGoCategories}>Categorías</button>
          <button style={styles.btnPrimary} onClick={onGoIncome}>+ Ingreso</button>
          <button style={styles.btnPrimary} onClick={onGoExpense}>+ Gasto</button>
          <button style={styles.btnPrimary} onClick={onGoDebts}>+ Deuda</button>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f6f8fb", padding: "28px 16px" },
  container: { maxWidth: 980, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", marginBottom: 18 },
  title: { margin: 0, fontSize: 52, letterSpacing: 1, color: "#102a43" },
  subtitle: { margin: "6px 0 0", color: "#334e68", fontSize: 16 },
  filters: { display: "flex", gap: 10, alignItems: "center" },
  select: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d9e2ec", background: "white" },
  year: { width: 90, padding: "10px 12px", borderRadius: 10, border: "1px solid #d9e2ec", background: "white" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 },
  card: { background: "white", border: "1px solid #e6edf5", borderRadius: 16, padding: 18, boxShadow: "0 8px 20px rgba(16,42,67,0.06)" },
  cardTitle: { margin: 0, fontSize: 16, color: "#102a43", fontWeight: 700 },
  levelRow: { marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: 'center' },
  levelBig: { fontSize: 22, fontWeight: 800, color: "#102a43" },
  levelMeta: { color: "#334e68", fontSize: 13 },
  money: { marginTop: 10, fontSize: 36, fontWeight: 900, color: "#102a43" },
  badge: { display: "inline-block", padding: "6px 14px", borderRadius: 999, background: "#edf2ff", color: "#364fc7", fontWeight: 700, fontSize: 12 },
  muted: { marginTop: 8, color: "#52606d", fontSize: 13 },
  actions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 },
  btnPrimary: { padding: "14px 22px", borderRadius: 12, background: "#102a43", color: "white", fontWeight: 800, border: 'none', cursor: 'pointer' },
  btnSecondary: { padding: "14px 22px", borderRadius: 12, background: "white", color: "#102a43", border: "1px solid #bcccdc", fontWeight: 800, cursor: 'pointer' },
  th: { padding: '12px 8px', color: '#627d98', fontSize: 11, textTransform: 'uppercase' },
  td: { padding: '14px 8px', fontSize: 14, color: '#102a43' }
};