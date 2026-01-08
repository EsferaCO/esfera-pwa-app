import { useMemo, useState } from "react";

function money(n) {
  return (Number(n || 0)).toLocaleString("es-CO");
}

export default function Income({ goBack, accounts, addTxn, deleteTxn, txns }) {
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("Ingreso laboral");

  const incomeTxns = useMemo(() => txns.filter((t) => t.type === "income"), [txns]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={goBack} style={styles.back}>← Volver</button>

        <h1 style={styles.h1}>Registrar ingreso</h1>

        <div style={styles.card}>
          <div style={styles.form}>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción (ej: Ingreso laboral)"
              style={styles.input}
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Monto"
              type="number"
              style={styles.input}
            />
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={styles.select}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={styles.input} />
            <button
              style={styles.btnPrimary}
              onClick={() => {
                if (!accountId) return;
                if (!Number(amount)) return;
                addTxn({ type: "income", amount, accountId, date, description });
                setAmount("");
              }}
            >
              Agregar
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>Ingresos registrados</h2>

          {incomeTxns.length === 0 ? (
            <p style={styles.muted}>Aún no tienes ingresos.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Descripción</th>
                  <th style={styles.th}>Cuenta</th>
                  <th style={styles.thRight}>Monto</th>
                  <th style={styles.thRight}></th>
                </tr>
              </thead>
              <tbody>
                {incomeTxns.map((t) => {
                  const accountName = accounts.find((a) => a.id === t.accountId)?.name || "—";
                  return (
                    <tr key={t.id} style={styles.tr}>
                      <td style={styles.td}>{t.date}</td>
                      <td style={styles.td}>{t.description || "Ingreso"}</td>
                      <td style={styles.td}>{accountName}</td>
                      <td style={styles.tdRight}>$ {money(t.amount)}</td>
                      <td style={styles.tdRight}>
                        <button style={styles.btnDanger} onClick={() => deleteTxn(t.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
  card: {
    marginTop: 16,
    background: "white",
    border: "1px solid #e6edf5",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 8px 20px rgba(16,42,67,0.06)",
  },
  form: { display: "flex", gap: 10, flexWrap: "wrap" },
  input: { padding: "12px 12px", borderRadius: 12, border: "1px solid #d9e2ec", minWidth: 210 },
  select: { padding: "12px 12px", borderRadius: 12, border: "1px solid #d9e2ec", background: "white", minWidth: 210 },
  btnPrimary: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #bcccdc",
    background: "#102a43",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  h2: { margin: 0, fontSize: 16, color: "#102a43" },
  muted: { color: "#52606d" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 12 },
  th: { textAlign: "left", fontSize: 12, color: "#52606d", padding: "10px 8px", borderBottom: "1px solid #e6edf5" },
  thRight: { textAlign: "right", fontSize: 12, color: "#52606d", padding: "10px 8px", borderBottom: "1px solid #e6edf5" },
  tr: { borderBottom: "1px solid #f0f4f8" },
  td: { padding: "10px 8px" },
  tdRight: { padding: "10px 8px", textAlign: "right" },
  btnDanger: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #ffe3e3",
    background: "#fff5f5",
    color: "#c92a2a",
    fontWeight: 900,
    cursor: "pointer",
  },
};
