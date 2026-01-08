export default function PieGastos({ esenciales, noEsenciales, ahorro }) {
  const total = Number(esenciales || 0) + Number(noEsenciales || 0) + Number(ahorro || 0);

  // No mostrar gráfica si no hay datos
  if (total === 0) {
    return (
      <p style={{ marginTop: 30, fontStyle: "italic", color: "#64748b" }}>
        Aún no hay gastos registrados este mes.
      </p>
    );
  }

  // Construcción segura de segmentos (🔑 elimina valores en 0)
  const segments = [
    { label: "Esenciales", value: Number(esenciales || 0), color: "#ef4444" },
    { label: "No esenciales", value: Number(noEsenciales || 0), color: "#f59e0b" },
    { label: "Ahorro", value: Number(ahorro || 0), color: "#22c55e" },
  ].filter((s) => s.value > 0);

  const getPercent = (v) => ((v / total) * 100).toFixed(1);

  let offset = 0;

  return (
    <div style={{ marginTop: 40 }}>
      <h3 style={{ marginBottom: 12 }}>Distribución de gastos</h3>

      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        {/* PIE */}
        <svg width="180" height="180" viewBox="0 0 32 32">
          {/* Fondo */}
          <circle r="16" cx="16" cy="16" fill="#e5e7eb" />

          {/* Segmentos */}
          {segments.map((seg, i) => {
            const pct = (seg.value / total) * 100;
            const circle = (
              <circle
                key={i}
                r="16"
                cx="16"
                cy="16"
                fill="transparent"
                stroke={seg.color}
                strokeWidth="32"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={offset}
              />
            );
            offset -= pct;
            return circle;
          })}
        </svg>

        {/* LEYENDA */}
        <div style={{ display: "grid", gap: 8 }}>
          {segments.map((seg) => (
            <p key={seg.label} style={{ margin: 0, fontSize: 14 }}>
              <span style={{ fontWeight: 700, color: seg.color }}>●</span>{" "}
              {seg.label}: {getPercent(seg.value)}%
            </p>
          ))}
        </div>
      </div>

      {/* 🎯 BONUS UX */}
      {segments.length === 1 && (
        <p style={{ marginTop: 12, color: "#64748b", fontStyle: "italic" }}>
          Aún no hay distribución completa de gastos este mes.
        </p>
      )}
    </div>
  );
}
