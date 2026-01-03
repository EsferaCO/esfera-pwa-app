import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Auth from "./pages/Auth";
import Home from "./pages/Home";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión actual al cargar la app
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Escuchar cambios de sesión (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Cargando...</p>;
  }

  // 🔒 NO autenticado → Login
  if (!session) {
    return <Auth />;
  }

  // ✅ Autenticado → Home (maqueta)
  return <Home />;
}
