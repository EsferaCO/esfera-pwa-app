import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  // SIGN UP (CREAR USUARIO)
  const handleSignUp = async () => {
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    alert("Usuario creado. Revisa tu correo si Supabase pide confirmación.");
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Ingreso a ESFERA</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <button
          type="button"
          onClick={handleSignUp}
          style={{ ...styles.button, backgroundColor: "#eee" }}
        >
          Crear cuenta
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    width: "100%",
    maxWidth: 380,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    padding: 10,
    fontSize: 14,
  },
  button: {
    padding: 10,
    fontSize: 15,
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: 13,
    textAlign: "center",
  },
};
