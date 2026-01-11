import { useState } from "react";

function money(n) {
  return Math.round(Number(n || 0)).toLocaleString("es-CO");
}

export default function Debts({ goBack, debts, setDebts, addTxn, accounts, categories }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    interest: "",
    monthlyPayment: "",
    categoryId: "",
    totalInstallments: "", // Cuotas totales
    currentInstallment: "0", // Cuota actual
    isLegacy: false // ¿Es deuda antigua?
  });

  const [sortMethod, setSortMethod] = useState("Flujo0");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");

  // 1. ORDENAMIENTO DINÁMICO
  const sortedDebts = [...(debts || [])].sort((a, b) => {
    const bA = Number(a.balance) || 0;
    const bB = Number(b.balance) || 0;
    const cA = Number(a.monthlyPayment) || 0;
    const cB = Number(b.monthlyPayment) || 0;
    if (sortMethod === "Flujo0") return (cB / (bB || 1)) - (cA / (bA || 1));
    if (sortMethod === "Bola de nieve") return bA - bB;
    if (sortMethod === "Avalancha") return (Number(b.interest) || 0) - (Number(a.interest) || 0);
    return 0;
  });

  function createDebt() {
    if (!form.name || !form.amount || !form.categoryId || !form.totalInstallments) {
      alert("Por favor completa: Nombre, Monto, Categoría y Cuotas totales.");
      return;
    }

    const newDebt = {
      id: crypto.randomUUID(),
      name: form.name,
      balance: Math.round(Number(form.amount)),
      interest: Number(form.interest || 0),
      monthlyPayment: Math.round(Number(form.monthlyPayment || 0)),
      categoryId: form.categoryId,
      totalInstallments: Number(form.totalInstallments),
      currentInstallment: Number(form.currentInstallment || 0)
    };

    setDebts((prev) => [...prev, newDebt]);
    // Reset form
    setForm({ name: "", amount: "", interest: "", monthlyPayment: "", categoryId: "", totalInstallments: "", currentInstallment: "0", isLegacy: false });
  }

  function registerPayment(debt) {
    if (!selectedAccountId) return alert("Selecciona una cuenta");
    if (debt.currentInstallment >= debt.totalInstallments) return alert("Esta deuda ya está paga según el plan de cuotas.");

    // LÓGICA DE AMORTIZACIÓN REAL
    // Tasa mensual a partir de E.A.
    const monthlyRate = Math.pow(1 + (Number(debt.interest) / 100), 1/12) - 1;
    const interestValue = Math.round(Number(debt.balance) * monthlyRate);
    const capitalReduction = Number(debt.monthlyPayment) - interestValue;
    
    const nextBalance = Math.max(0, Math.round(Number(debt.balance) - Math.max(0, capitalReduction)));
    const nextInstallment = Number(debt.currentInstallment) + 1;

    setDebts((prev) => prev.map((d) => 
      d.id === debt.id 
        ? { ...d, balance: nextBalance, currentInstallment: nextInstallment } 
        : d
    ));

    addTxn({
      type: "expense",
      amount: Math.round(Number(debt.monthlyPayment)),
      accountId: selectedAccountId,
      date: new Date().toISOString().slice(0, 10),
      description: `Pago cuota ${nextInstallment}/${debt.totalInstallments}: ${debt.name}`,
      categoryId: debt.categoryId,
    });
  }

  const updateDebtField = (id, field, value) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: Number(value) } : d));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <button onClick={goBack} style={styles.btnBack}>← Volver</button>
          <h1 style={styles.title}>Deudas & Amortización</h1>
        </header>

        <section style={styles.grid}>
          {/* REGISTRO DE DEUDA */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Registrar Deuda</h2>
            <div style={styles.formGroup}>
              <input style={styles.input} placeholder="Nombre (ej. Carro)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input style={styles.input} type="number" placeholder="Saldo actual" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{...styles.input, flex:1}} type="number" placeholder="Cuota $" value={form.monthlyPayment} onChange={e => setForm({...form, monthlyPayment: e.target.value})} />
                <input style={{...styles.input, flex:1}} type="number" placeholder="Int. E.A. %" value={form.interest} onChange={e => setForm({...form, interest: e.target.value})} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input style={{...styles.input, flex:1}} type="number" placeholder="¿Cuántas cuotas TOTALES?" value={form.totalInstallments} onChange={e => setForm({...form, totalInstallments: e.target.value})} />
                <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 5}}>
                  <input type="checkbox" checked={form.isLegacy} onChange={e => setForm({...form, isLegacy: e.target.checked})} />
                  <label style={{fontSize: 10}}>¿Deuda antigua?</label>
                </div>
              </div>

              {form.isLegacy && (
                <input style={styles.input} type="number" placeholder="¿En qué cuota vas actualmente?" value={form.currentInstallment} onChange={e => setForm({...form, currentInstallment: e.target.value})} />
              )}

              <select style={styles.select} value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                <option value="">Seleccionar Categoría...</option>
                {categories.filter(c => c.type.includes("Gasto")).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button style={styles.btnCreate} onClick={createDebt}>Guardar en Plan</button>
            </div>
          </div>

          {/* PLAN DE PAGOS */}
          <div style={styles.card}>
            <div style={styles.flexBetween}>
              <h2 style={styles.cardTitle}>Mi Estrategia</h2>
              <div style={styles.tabGroup}>
                {["Flujo0", "Bola de nieve", "Avalancha"].map(m => (
                  <button key={m} onClick={() => setSortMethod(m)} style={{ ...styles.tab, background: sortMethod === m ? "#102a43" : "#f0f4f8", color: sortMethod === m ? "white" : "#102a43" }}>{m}</button>
                ))}
              </div>
            </div>

            <select style={styles.selectAccount} value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (${money(a.balance)})</option>)}
            </select>

            <div style={styles.debtList}>
              {sortedDebts.map(d => {
                const cat = categories.find(c => String(c.id) === String(d.categoryId));
                const progress = (d.currentInstallment / d.totalInstallments) * 100;
                
                return (
                  <div key={d.id} style={styles.debtBox}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.flexBetween}>
                        <span style={styles.debtName}>{d.name} <small style={styles.tag}>{cat?.name}</small></span>
                        <div style={{textAlign: 'right'}}>
                           <span style={{fontSize: 11, fontWeight: 'bold', color: '#102a43'}}>Cuota {d.currentInstallment}/{d.totalInstallments}</span>
                           <button onClick={() => setDebts(prev => prev.filter(x => x.id !== d.id))} style={styles.btnDel}>🗑️</button>
                        </div>
                      </div>
                      
                      {/* Barra de progreso visual */}
                      <div style={styles.progressBg}><div style={{...styles.progressFill, width: `${progress}%`}}></div></div>

                      <div style={styles.valueRow}>
                        <div style={{ flex: 1 }}>
                          <span style={styles.miniLabel}>SALDO: $ {money(d.balance)}</span>
                          <input type="number" style={styles.inputInline} value={d.balance} onChange={e => updateDebtField(d.id, 'balance', e.target.value)} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={styles.miniLabel}>CUOTA: $ {money(d.monthlyPayment)}</span>
                          <input type="number" style={styles.inputInline} value={d.monthlyPayment} onChange={e => updateDebtField(d.id, 'monthlyPayment', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <button style={styles.btnPay} onClick={() => registerPayment(d)}>Pagar</button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f8fafc", minHeight: "100vh", padding: "20px" },
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: { marginBottom: "20px" },
  btnBack: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "bold" },
  title: { fontSize: "24px", color: "#102a43", margin: "10px 0", fontWeight: 800 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px" },
  card: { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" },
  cardTitle: { fontSize: "16px", marginBottom: "15px", color: "#102a43", fontWeight: "bold" },
  formGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" },
  inputInline: { width: "100%", padding: "5px", marginTop: "4px", borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: "11px", fontWeight: "bold" },
  select: { padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", fontSize: "13px" },
  btnCreate: { padding: "12px", background: "#102a43", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  flexBetween: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  tabGroup: { display: "flex", gap: "4px" },
  tab: { padding: "4px 8px", border: "none", borderRadius: "6px", fontSize: "10px", fontWeight: "bold", cursor: "pointer" },
  selectAccount: { width: "100%", padding: "10px", margin: "15px 0", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" },
  debtList: { display: "flex", flexDirection: "column", gap: "12px" },
  debtBox: { display: "flex", alignItems: "center", gap: "12px", padding: "15px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fcfdfe" },
  progressBg: { background: '#e2e8f0', height: 4, borderRadius: 2, margin: '8px 0', overflow: 'hidden' },
  progressFill: { background: '#102a43', height: '100%', transition: 'width 0.3s ease' },
  debtName: { fontWeight: "bold", color: "#1e293b", fontSize: "14px" },
  tag: { fontSize: "9px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#64748b" },
  valueRow: { display: "flex", gap: "10px", marginTop: "8px" },
  miniLabel: { fontSize: "10px", fontWeight: "bold", color: "#94a3b8", display: "block" },
  btnPay: { padding: "12px 20px", background: "#102a43", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  btnDel: { background: "none", border: "none", cursor: "pointer", fontSize: "12px", marginLeft: 10 },
};