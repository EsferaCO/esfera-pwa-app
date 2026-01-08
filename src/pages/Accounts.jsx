import { useState } from "react";

function money(n) {
  return (Number(n || 0)).toLocaleString("es-CO");
}

export default function Accounts({ goBack, accounts, balancesMap, addAccount, deleteAccount }) {
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().slice(0, 10));

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={goBack} style={styles.back}>← Volver</button>

        <h1 style={styles.h1}>Cuentas</h1>
        <p style={styles.p}>Agrega tus cuentas y define su saldo inicial.</p>

        <div style={styles.card}>
          <h2 style={styles.h2}>Nueva cuenta</h2>
          <div style={styles.form}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (ej: Ahorros Bogotá)" style={styles.input} />
            <input value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} placeholder="Saldo inicial" type="number" style={styles.input} />
            <input value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} type="date" style={styles.input} />
            <button
              style={styles.btnPrimary}
              onClick={() => {
                if (!name.trim()) return;
                addAccount({ name, initialBalance, createdAt });
                setName("");
                setInitialBalance("");
              }}
            >
              Agregar
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>Tus cuentas</h2>

          {accounts.length === 0 ? (
            <p style={styles.muted}>Aún no tienes cuentas. Agrega al menos una.</p>
          ) : (
            <div style={styles.list}>
              {accounts.map((a) => (
                <div key={a.id} style={styles.item}>
                  <div>
                    <div style={styles.itemTitle}>{a.name}</div>
                    <div style={styles.itemMeta}>
                      Inicial: $ {money(a.initialBalance)} · Creación: {a.createdAt}
                    </div>
                    <div style={styles.itemBalance}>
                      Saldo actual: <strong>$ {money(balancesMap.get(a.id) || 0)}</strong>
                    </div>
                  </div>

                  <button style={styles.btnDanger} onClick={() => deleteAccount(a.id)}>
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}

          <p style={styles.note}>
            Nota: si eliminas una cuenta, también se eliminarán sus movimientos asociados (para mantener consistencia).
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
  card: {
    marginTop: 16,
    background: "white",
    border: "1px solid #e6edf5",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 8px 20px rgba(16,42,67,0.06)",
  },
  h2: { margin: 0, fontSize: 16, color: "#102a43" },
  form: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  input: { padding: "12px 12px", borderRadius: 12, border: "1px solid #d9e2ec", minWidth: 220 },
  btnPrimary: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #bcccdc",
    background: "#102a43",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  list: { marginTop: 12, display: "grid", gap: 10 },
  item: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    border: "1px solid #e6edf5",
    borderRadius: 14,
    padding: 14,
    background: "#fbfdff",
  },
  itemTitle: { fontWeight: 900, color: "#102a43" },
  itemMeta: { marginTop: 4, fontSize: 12, color: "#52606d" },
  itemBalance: { marginTop: 8, color: "#102a43" },
  btnDanger: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ffe3e3",
    background: "#fff5f5",
    color: "#c92a2a",
    fontWeight: 900,
    cursor: "pointer",
    height: 42,
  },
  muted: { color: "#52606d" },
  note: { marginTop: 12, color: "#52606d", fontStyle: "italic" },
};
