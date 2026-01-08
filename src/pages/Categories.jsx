import { useMemo, useState } from "react";

function money(n) {
  return (Number(n || 0)).toLocaleString("es-CO");
}

function toMonthKey(dateStr) {
  const [y, m] = dateStr.split("-").map(Number);
  return { y, m };
}

export default function Categories({
  goBack,
  categories,
  addCategory,
  deleteCategory,
  updateCategory,
  txns,
  selectedYear,
  selectedMonth,
}) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Gasto variable");

  // ingresos del mes filtrado (no fijo)
  const monthlyIncome = useMemo(() => {
    return txns
      .filter((t) => t.type === "income")
      .filter((t) => {
        if (!t.date) return false;
        const { y, m } = toMonthKey(t.date);
        return y === Number(selectedYear) && m === Number(selectedMonth);
      })
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [txns, selectedYear, selectedMonth]);

  const totalPercent = useMemo(() => {
    return categories.reduce((sum, c) => sum + Number(c.percent || 0), 0);
  }, [categories]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={goBack} style={styles.back}>← Volver</button>

        <h1 style={styles.h1}>Categorías</h1>
        <p style={styles.p}>
          Define tu estructura financiera. Los porcentajes los decides tú.
        </p>

        <div style={styles.addRow}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nueva categoría (ej: Mascotas)"
            style={styles.input}
          />
          <select value={newType} onChange={(e) => setNewType(e.target.value)} style={styles.select}>
            <option>Gasto fijo</option>
            <option>Gasto variable</option>
            <option>Ahorro / Inversión</option>
            <option>Ahorro</option>
            <option>Ingreso</option>
          </select>
          <button
            style={styles.btnPrimary}
            onClick={() => {
              addCategory({ name: newName, type: newType });
              setNewName("");
              setNewType("Gasto variable");
            }}
          >
            Agregar
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.meta}>
            <div>
              <div style={styles.metaLabel}>Ingreso del mes (base para presupuesto)</div>
              <div style={styles.metaValue}>$ {money(monthlyIncome)}</div>
            </div>
            <div>
              <div style={styles.metaLabel}>Total asignado</div>
              <div style={styles.metaValue}>{totalPercent}%</div>
            </div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Esencial</th>
                <th style={styles.th}>%</th>
                <th style={styles.th}>Presupuesto mensual</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const pct = Number(cat.percent || 0);
                const budget = (monthlyIncome * pct) / 100;

                return (
                  <tr key={cat.id} style={styles.tr}>
                    <td style={styles.td}>
                      <input
                        value={cat.name}
                        onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                        style={styles.cellInput}
                      />
                    </td>
                    <td style={styles.td}>
                      <select
                        value={cat.type}
                        onChange={(e) => updateCategory(cat.id, { type: e.target.value })}
                        style={styles.cellSelect}
                      >
                        <option>Ingreso</option>
                        <option>Gasto fijo</option>
                        <option>Gasto variable</option>
                        <option>Ahorro / Inversión</option>
                        <option>Ahorro</option>
                      </select>
                    </td>
                    <td style={styles.tdCenter}>
                      <input
                        type="checkbox"
                        checked={!!cat.essential}
                        onChange={(e) => updateCategory(cat.id, { essential: e.target.checked })}
                      />
                    </td>
                    <td style={styles.tdCenter}>
                      <input
                        type="number"
                        value={cat.percent}
                        onChange={(e) => updateCategory(cat.id, { percent: e.target.value })}
                        style={styles.percentInput}
                        min={0}
                        max={100}
                      />
                    </td>
                    <td style={styles.tdRight}>$ {money(budget)}</td>
                    <td style={styles.tdRight}>
                      <button style={styles.btnDanger} onClick={() => deleteCategory(cat.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p style={styles.note}>
            Para mejorar tu nivel financiero, aplica la estrategia recomendada en el Método ESFERA.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f6f8fb", padding: "28px 16px" },
  container: { maxWidth: 980, margin: "0 auto" },
  back: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #bcccdc",
    background: "white",
    cursor: "pointer",
    fontWeight: 800,
    color: "#102a43",
  },
  h1: { margin: "18px 0 6px", fontSize: 44, color: "#102a43" },
  p: { margin: 0, color: "#52606d" },
  addRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 },
  input: { padding: "12px 12px", borderRadius: 12, border: "1px solid #d9e2ec", minWidth: 260 },
  select: { padding: "12px 12px", borderRadius: 12, border: "1px solid #d9e2ec", background: "white" },
  btnPrimary: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #bcccdc",
    background: "#102a43",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  card: {
    marginTop: 16,
    background: "white",
    border: "1px solid #e6edf5",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 8px 20px rgba(16,42,67,0.06)",
  },
  meta: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  metaLabel: { fontSize: 12, color: "#52606d", fontWeight: 800 },
  metaValue: { marginTop: 6, fontSize: 18, fontWeight: 900, color: "#102a43" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 14 },
  th: { textAlign: "left", fontSize: 12, color: "#52606d", padding: "10px 8px", borderBottom: "1px solid #e6edf5" },
  tr: { borderBottom: "1px solid #f0f4f8" },
  td: { padding: "10px 8px" },
  tdCenter: { padding: "10px 8px", textAlign: "center" },
  tdRight: { padding: "10px 8px", textAlign: "right" },
  cellInput: { width: "100%", padding: "10px 10px", borderRadius: 10, border: "1px solid #d9e2ec" },
  cellSelect: { width: "100%", padding: "10px 10px", borderRadius: 10, border: "1px solid #d9e2ec", background: "white" },
  percentInput: { width: 90, padding: "10px 10px", borderRadius: 10, border: "1px solid #d9e2ec" },
  btnDanger: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ffe3e3",
    background: "#fff5f5",
    color: "#c92a2a",
    fontWeight: 900,
    cursor: "pointer",
  },
  note: { marginTop: 18, color: "#52606d", fontStyle: "italic" },
};
