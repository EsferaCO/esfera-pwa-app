export default function PieGastos({ esenciales, noEsenciales, ahorro }) {
 const total = esenciales + noEsenciales + ahorro;
  if (total === 0) {
    return <p style={{ marginTop: 20, color: "#64748b" }}>
      Aún no hay datos suficientes para analizar gastos.
    </p>;
  }

  const data = [
    { label: "Esenciales", value: esenciales, color: "#ef4444" },
    { label: "No esenciales", value: noEsenciales, color: "#f59e0b" },
    { label: "Ahorro", value: ahorro, color: "#22c55e" },
  ];

  const max = Math.max(...data.map(d => d.value));

  return (
    <div style={{ marginTop: 32 }}>
      <h3>Distribución de gastos</h3>

      {data.map(d => (
        <div key={d.label} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14 }}>{d.label}</div>
          <div style={{
            height: 16,
            background: "#e5e7eb",
            borderRadius: 8,
            overflow: "hidden"
          }}>
            <div style={{
              width: `${(d.value / max) * 100}%`,
              background: d.color,
              height: "100%"
            }} />
          </div>
          <small>${d.value.toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}