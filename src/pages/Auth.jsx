import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);

    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>ESFERA</h1>
          <h2 style={styles.subtitle}>{isLogin ? "Iniciar sesión" : "Crear cuenta"}</h2>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btnPrimary}>
            {loading ? "Procesando..." : isLogin ? "Entrar" : "Registrarme"}
          </button>
        </form>

        <div style={styles.toggleContainer}>
          <p style={styles.toggleText}>
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          </p>
          <button type="button" onClick={() => setIsLogin(!isLogin)} style={styles.btnLink}>
            {isLogin ? "Crear cuenta nueva" : "Iniciar sesión"}
          </button>
        </div>

        <div style={styles.footer}>
          <p>
            Desarrollado por <strong>Andrés Bonilla Betancourt</strong>, Magíster en Finanzas. @andresbetancourt.co
          </p>
          <p style={{ marginTop: 8 }}>
            ESFERA es una herramienta educativa y no constituye asesoría financiera personalizada.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb", // Mismo fondo gris/azulado de la app
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: 24, // Bordes más redondeados para un look moderno
    padding: "40px",
    width: "100%",
    maxWidth: "480px", // Un poco más ancho para elegancia
    boxShadow: "0 20px 40px rgba(16,42,67,0.08)", // Sombra suave
    border: "1px solid #e6edf5",
    textAlign: "center",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "36px",
    color: "#102a43", // Azul oscuro corporativo
    fontWeight: 900,
    letterSpacing: "-1px",
  },
  subtitle: {
    margin: 0,
    fontSize: "20px",
    color: "#627d98", // Azul grisáceo para subtítulos
    fontWeight: 600,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    marginBottom: "32px",
  },
  inputGroup: {
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#334e68",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "2px solid #d9e2ec", // Borde sutil
    background: "#f8fafc", // Fondo ligeramente gris para inputs
    fontSize: "16px",
    color: "#102a43",
    outline: "none",
    transition: "border-color 0.2s",
  },
  btnPrimary: {
    width: "100%",
    padding: "16px",
    borderRadius: 12,
    background: "#102a43", // Color principal
    color: "white",
    fontSize: "18px",
    fontWeight: 800,
    border: "none",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(16,42,67,0.2)",
    transition: "transform 0.1s",
  },
  toggleContainer: {
    marginBottom: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #f0f4f8",
  },
  toggleText: {
    margin: "0 0 8px 0",
    color: "#627d98",
  },
  btnLink: {
    background: "none",
    border: "none",
    color: "#102a43",
    fontWeight: 800,
    fontSize: "16px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  footer: {
    fontSize: "11px",
    color: "#829ab1",
    lineHeight: 1.5,
  },
};