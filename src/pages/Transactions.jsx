import { useState } from "react";

export default function Transactions({
  accounts,
  setAccounts,
  transactions,
  setTransactions,
  goBack,
}) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState("");

  const addTransaction = () => {
    if (!amount || !accountId || !date) return;

    const numericAmount = Number(amount);

    // 1️⃣ Guardar transacción
    setTransactions([
      ...transactions,
      {
        id: Date.now(),
        type,
        amount: numericAmount,
        accountId,
        date,
      },
    ]);

    // 2️⃣ Actualizar saldo de la cuenta
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === Number(accountId)
          ? {
              ...acc,
              currentBalance:
                type === "income"
                  ? acc.currentBalance + numericAmount
                  : acc.currentBalance - numericAmount,
            }
          : acc
      )
    );

    setAmount("");
    setAccountId("");
    setDate("");
  };

  return (
    <div style={styles.container}>
      <button onClick={goBack}>← Volver</button>

      <h1>Registrar movimiento</h1>

      <div style={styles.form}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>

        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">Cuenta</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={addTransaction}>Agregar</button>
      </div>

      {transactions.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cuenta</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td>
                  {accounts.find((a) => a.id === Number(t.accountId))?.name}
                </td>
                <td>${t.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: "0 auto", padding: 20 },
  form: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 },
  table: { width: "100%", borderCollapse: "collapse" },
};
