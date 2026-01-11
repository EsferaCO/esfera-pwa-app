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
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>{isLogin ? "Iniciar sesión" : "Crear cuenta"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : isLogin ? "Entrar" : "Registrarme"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Crear cuenta" : "Iniciar sesión"}
        </button>
      </p>

      <p style={{ marginTop: 30, fontSize: 12, color: "#64748b" }}>
        Desarrollado por <strong>Andrés Bonilla Betancourt</strong>, Magíster en Finanzas. @andresbetancourt.co 
        <br />
        ESFERA es una herramienta educativa y no constituye asesoría financiera personalizada.
      </p>
    </div>
  );
}
