import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { useAuth } from "../hooks/useAuth";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export function FanCluPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const error = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(false);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-2 border-[var(--color-pop-red)] border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold font-display text-white mb-6">
            Fan Clú
          </h1>
          <p className="text-zinc-300 text-lg mb-8">
            ¡Bienvenido/a, {user?.email}!
          </p>
          <p className="text-zinc-400 mb-8">
            Contenido exclusivo próximamente.
          </p>
          <button
            onClick={logout}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
          {/* Left: Teaser */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold font-display text-white mb-4">
              Fan Clú
            </h1>
            <p className="text-zinc-300 text-lg mb-8">
              El rincón exclusivo para los verdaderos fans de Metal Prog Pop.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-300">
                Bonus content
              </span>
              <span className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-300">
                Behind the scenes
              </span>
              <span className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-300">
                Notas exclusivas
              </span>
            </div>
          </div>

          {/* Right: Login form */}
          <div className="flex-1 w-full">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              {error && (
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6 text-red-300 text-sm">
                  El link es inválido o expirado. Intentá de nuevo.
                </div>
              )}

              {submitError && (
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6 text-red-300 text-sm">
                  Hubo un error. Intentá de nuevo.
                </div>
              )}

              {submitted ? (
                <div className="text-center py-4">
                  <p className="text-zinc-300 text-lg">
                    Si tu email está registrado, te enviamos un link de acceso.
                  </p>
                  <p className="text-zinc-500 text-sm mt-4">
                    Revisá tu bandeja de entrada.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Ingresá con tu email
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 mb-4 focus:outline-none focus:border-[var(--color-pop-red)] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[var(--color-pop-red)] hover:bg-[var(--color-pop-red)]/90 text-white font-semibold rounded-lg px-4 py-3 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? "Enviando..." : "Enviar magic link"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
