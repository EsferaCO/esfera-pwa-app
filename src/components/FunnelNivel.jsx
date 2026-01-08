export default function FunnelNivel({ nivelActual }) {
  const niveles = [
    { id: 5, label: "Libre", desc: "Trabajas por decisión, no por presión financiera." },
    { id: 4, label: "Estratégico", desc: "Estás en posición de invertir, emprender o cambiar de rumbo con menor riesgo." },
    { id: 3, label: "Preparado", desc: "Tu vida financiera es sólida. Puedes decidir con calma." },
    { id: 2, label: "Equilibrado", desc: "Empiezas a tener control. Puedes resistir shocks sin colapsar." },
    { id: 1, label: "Inestable", desc: "Tienes margen mínimo y dependencia total del próximo ingreso." },
    { id: 0, label: "Vulnerable", desc: "Vives al día. Cualquier imprevisto te obliga a endeudarte." },
  ];

  return (
    <div style={{ marginTop: 40 }}>
      <h3>Nivel financiero</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {niveles.map((n) => (
          <div
            key={n.id}
            style={{
              padding: "12px 16px",
              borderRadius: 20,
              background: n.id === nivelActual ? "#2563eb" : "#e5e7eb",
              color: n.id === nivelActual ? "#fff" : "#111",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>Nivel {n.id} · {n.label}</strong>
              <div style={{ fontSize: 12 }}>{n.desc}</div>
            </div>

            {n.id === nivelActual && (
              <span style={{ fontSize: 20 }}>👤</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
