import { useState } from "react";

function money(n) {
  return (Number(n || 0)).toLocaleString("es-CO");
}

export default function Accounts({ goBack, accounts, balancesMap, addAccount, deleteAccount, addTxn }) {
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().slice(0, 10));

  const [transfer, setTransfer] = useState({ fromId: "", toId: "", amount: "" });

  const handleAdd = () => {
    if (!name.trim() || !initialBalance) return alert("Completa los datos");
    addAccount({ name: name.trim(), initialBalance: Number(initialBalance), createdAt });
    setName(""); setInitialBalance("");
  };

  const handleTransfer = () => {
    const { fromId, toId, amount } = transfer;
    if (!fromId || !toId || !amount || Number(amount) <= 0) return alert("Datos inválidos");
    if (fromId === toId) return alert("Las cuentas deben ser diferentes");

    const val = Number(amount);
    const date = new Date().toISOString().slice(0, 10);

    // Salida
    addTxn({ type: "expense", amount: val, accountId: fromId, date, description: `TRASPASO -> ${accounts.find(a=>a.id===toId)?.name}`, categoryId: "" });
    // Entrada
    addTxn({ type: "income", amount: val, accountId: toId, date, description: `TRASPASO <- ${accounts.find(a=>a.id===fromId)?.name}`, categoryId: "" });

    alert("Traspaso exitoso");
    setTransfer({ fromId: "", toId: "", amount: "" });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <button onClick={goBack} style={styles.back}>← Volver</button>
          <h1 style={styles.h1}>Cuentas</h1>
        </header>

        <div style={styles.grid}>
          <div style={styles.column}>
            {/* NUEVA CUENTA */}
            <div style={styles.card}>
              <h2 style={styles.h2}>Nueva Cuenta</h2>
              <div style={styles.form}>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" style={styles.input} />
                <input type="number" value={initialBalance} onChange={e=>setInitialBalance(e.target.value)} placeholder="Saldo inicial" style={styles.input} />
                <button style={styles.btnPrimary} onClick={handleAdd}>Crear</button>
              </div>
            </div>

            {/* TRASPASO */}
            <div style={styles.card}>
              <h2 style={styles.h2}>Traspaso</h2>
              <div style={styles.form}>
                <select style={styles.select} value={transfer.fromId} onChange={e=>setTransfer({...transfer, fromId: e.target.value})}>
                  <option value="">Origen...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <select style={styles.select} value={transfer.toId} onChange={e=>setTransfer({...transfer, toId: e.target.value})}>
                  <option value="">Destino...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <input type="number" value={transfer.amount} onChange={e=>setTransfer({...transfer, amount: e.target.value})} placeholder="Monto" style={styles.input} />
                <button style={styles.btnTransfer} onClick={handleTransfer}>Mover Fondos</button>
              </div>
            </div>
          </div>

          <div style={styles.column}>
            <div style={styles.card}>
              <h2 style={styles.h2}>Tus Saldos</h2>
              <div style={styles.list}>
                {accounts.map(a => (
                  <div key={a.id} style={styles.item}>
                    <div>
                      <div style={styles.itemTitle}>{a.name}</div>
                      <div style={styles.itemBalance}>$ {money(balancesMap.get(a.id))}</div>
                    </div>
                    <button style={styles.btnDel} onClick={() => { if(confirm(`¿Borrar ${a.name}?`)) deleteAccount(a.id) }}>Eliminar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f6f8fb", padding: 20 },
  container: { maxWidth: 900, margin: "0 auto" },
  header: { marginBottom: 20 },
  back: { padding: "8px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "bold" },
  h1: { fontSize: 32, color: "#102a43", fontWeight: 900 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  column: { display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "white", borderRadius: 20, padding: 20, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" },
  h2: { margin: "0 0 15px 0", fontSize: 16, color: "#627d98", fontWeight: 800, textTransform: "uppercase" },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  input: { padding: 12, borderRadius: 12, border: "1px solid #d9e2ec", fontSize: 14 },
  select: { padding: 12, borderRadius: 12, border: "1px solid #d9e2ec", background: "white" },
  btnPrimary: { padding: 14, borderRadius: 12, border: "none", background: "#102a43", color: "white", fontWeight: "bold", cursor: "pointer" },
  btnTransfer: { padding: 14, borderRadius: 12, border: "none", background: "#486581", color: "white", fontWeight: "bold", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  item: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 15, border: "1px solid #f1f5f9", borderRadius: 16 },
  itemTitle: { fontWeight: 800, color: "#102a43" },
  itemBalance: { color: "#102a43", fontSize: 18, fontWeight: 900 },
  btnDel: { padding: "6px 10px", borderRadius: 8, border: "none", background: "#fff5f5", color: "#c53030", fontSize: 11, fontWeight: "bold", cursor: "pointer" }
};