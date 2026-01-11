import React from 'react';

const STAGES = [
  { id: 5, label: "Libre", color: "#22c55e", desc: "24+ meses: Trabajas por decisión, no por presión financiera." },
  { id: 4, label: "Estratégico", color: "#10b981", desc: "12 a <24 meses: Estás en posición de invertir, emprender" },
  { id: 3, label: "Preparado", color: "#3b82f6", desc: "6 a <12 meses: Tu vida financiera es sólida. Puedes decidir con calma." },
  { id: 2, label: "Equilibrado", color: "#6366f1", desc: "3 a <6 meses: Empiezas a tener control. Puedes resistir shocks sin colapsar." },
  { id: 1, label: "Inestable", color: "#f59e0b", desc: "1 a <3 meses: Tienes margen mínimo y dependencia total del próximo ingreso." },
  { id: 0, label: "Vulnerable", color: "#ef4444", desc: "0 a <1 mes: Vives al día. Cualquier imprevisto te obliga a endeudarte." },
];

export default function FunnelNivel({ nivelActual = 0 }) {
  return (
    <div style={fStyles.container}>
      <h3 style={fStyles.title}>Nivel de Libertad Financiera</h3>
      <div style={fStyles.funnelWrapper}>
        {STAGES.map((stage, index) => {
          const isActive = nivelActual === stage.id;
          const width = 100 - (index * 8); // Crea la forma de embudo

          return (
            <div key={stage.id} style={fStyles.stageRow}>
              {/* INDICADOR DE POSICIÓN (AVATAR) */}
              <div style={{ width: 40, textAlign: 'center' }}>
                {isActive && <span style={fStyles.avatar}>👤</span>}
              </div>

              {/* BLOQUE DEL EMBUDO */}
              <div
                style={{
                  ...fStyles.block,
                  width: `${width}%`,
                  backgroundColor: isActive ? stage.color : "#f1f5f9",
                  color: isActive ? "#fff" : "#94a3b8",
                  boxShadow: isActive ? `0 0 15px ${stage.color}80` : "none",
                  border: isActive ? `2px solid ${stage.color}` : "1px solid #e2e8f0",
                }}
              >
                <div style={fStyles.labelGroup}>
                  <span style={{ fontWeight: isActive ? 800 : 500 }}>{stage.label}</span>
                  <span style={fStyles.descText}>{stage.desc}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const fStyles = {
  container: { padding: "10px 0" },
  title: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 },
  funnelWrapper: { display: "flex", flexDirection: "column", gap: 6, alignItems: "center" },
  stageRow: { display: "flex", alignItems: "center", width: "100%", justifyContent: "center", gap: 10 },
  block: {
    height: 45,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    cursor: "default",
  },
  labelGroup: { display: "flex", flexDirection: "column", alignItems: "center" },
  descText: { fontSize: 9, opacity: 0.8 },
  avatar: { fontSize: 24, animation: "bounce 2s infinite" }
};