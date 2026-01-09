import { useState } from "react";

function money(n) {
  return Number(n || 0).toLocaleString("es-CO");
}

export default function Debts({
  accounts,
  onBack,
  onApplyAccountDelta, // función que ya usas para sumar/restar saldos
}) {
  const [debts, setDebts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    principal: "",
    interestRate: "",
    termMonths: "",
    includeInCashFlow: false,
    accountId: "",
  });

  const createDebt = () => {
    if (!form.name || !form.principal) return;

    const principal = Number(form.principal);
    const rate = Number(form.interestRate || 0) / 100 / 12;
    const months = Number(form.termMonths || 1);

    const monthlyPayment =
      rate === 0
        ? principal / months
        : (principal * rate) / (1 - Math.pow(1 + rate, -months));

    const debt = {
      id: crypto.randomUUID(),
      name: form.name,
      principal,
      remaining: principal,
      monthlyPayment,
      interestRate: Number(form.interestRate || 0),
      includeInCashFlow: form.includeInCashFlow,
      accountId: form.accountId || null,
    };

    setDebts((d) => [...d, debt]);

    // 🔑 regla clave
    if (debt.includeInCashFlow && debt.accountId) {
      onApplyAccountDelta(debt.accountId, principal);
    }

    setForm({
      name: "",
      principal: "",
      interestRate: "",
      termMonths: "",
      includeInCashFlow: false,
      accountId: "",
    });
  };

  const payDebt = (debtId) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId || d.remaining <= 0) return d;

        const interest =
          (d.remaining * d.interestRate) / 100 / 12;
        const capital = Math.min(
          d.monthlyPayment - interest,
          d.remaining
        );

        if (d.accountId) {
          onApplyAccountDelta(d.accountId, -d.monthlyPayment);
        }

        return {
          ...d,
          remaining: Math.max(0, d.remaining - capital),
        };
      })
    );
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack}>← Volver</button>

      <h1>Deudas</h1>

      <div style={styles.card}>
        <h3>Nueva deuda</h3>

        <input
          placeholder="Nombre (Banco, tarjeta, persona)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="number"
          placeholder="Monto de la deuda"
          value={form.principal}
          onChange={(e) => setForm({ ...form, principal: e.target.value })}
        />

        <input
          type="number"
          placeholder="Interés anual %"
          value={form.interestRate}
          onChange={(e) =>
            setForm({ ...form, interestRate: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Plazo (meses)"
          value={form.termMonths}
          onChange={(e) =>
            setForm({ ...form, termMonths: e.target.value })
          }
        />

       <label style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
  <input
    type="checkbox"
    checked={form.includeInCashFlow}
    onChange={(e) =>
      setForm({ ...form, includeInCashFlow: e.target.checked })
    }
  />
  <span>Incluir dinero en mi saldo disponible</span>
</label>


        {form.includeInCashFlow && (
          <select
            value={form.accountId}
            onChange={(e) =>
              setForm({ ...form, accountId: e.target.value })
            }
          >
            <option value="">Cuenta destino</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}

        <button onClick={createDebt}>Crear deuda</button>
      </div>

      <div style={styles.list}>
        {debts.map((d) => (
          <div key={d.id} style={styles.card}>
            <h3>{d.name}</h3>
            <p>Saldo pendiente: $ {money(d.remaining)}</p>
            <p>Cuota aprox: $ {money(d.monthlyPayment)}</p>

            <button
              disabled={d.remaining <= 0}
              onClick={() => payDebt(d.id)}
            >
              Registrar pago
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 700, margin: "0 auto", padding: 20 },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    display: "grid",
    gap: 8,
  },
  list: { marginTop: 30 },
};
