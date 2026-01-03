export default function Home() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>ESFERA</h1>
        <p>Control financiero personal</p>
      </header>

      <section style={styles.card}>
        <h2>Nivel financiero</h2>
        <p style={styles.big}>Nivel 0 · Vulnerable</p>
        <p>Vives al día. Cualquier imprevisto genera deuda.</p>
      </section>

      <section style={styles.card}>
        <h2>Fondo disponible</h2>
        <p style={styles.big}>$ 0</p>
        <p>Saldo total en tus cuentas</p>
      </section>

      <section style={styles.actions}>
        <button style={styles.button}>Registrar ingreso</button>
        <button style={styles.button}>Registrar gasto</button>
        <button style={styles.button}>Ver diagnóstico</button>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  big: {
    fontSize: 28,
    fontWeight: "bold",
    margin: "10px 0",
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  button: {
    padding: "10px 16px",
    fontSize: 14,
    cursor: "pointer",
  },
};
