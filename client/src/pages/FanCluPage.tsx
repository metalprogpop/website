import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { Card } from "../components/ui/brand/Card";
import { Button } from "../components/ui/brand/Button";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import {
  isTestUsersEnabled,
  isDevShowMagicLink,
  TEST_USER_EMAIL,
} from "../lib/devFlags";

type MagicLinkResponse = {
  message?: string;
  magicLink?: string;
  authenticated?: boolean;
};

export function FanCluPage() {
  const queryClient = useQueryClient();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const error = searchParams.get("error");

  const submitEmail = async (emailToSubmit: string): Promise<void> => {
    setSubmitting(true);
    setSubmitError(false);
    setMagicLink(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSubmit }),
        credentials: "include",
      });
      if (!res.ok) {
        setSubmitError(true);
        return;
      }
      const body = (await res.json()) as MagicLinkResponse;
      if (body.authenticated === true) {
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        return;
      }
      if (isDevShowMagicLink() && typeof body.magicLink === "string") {
        setMagicLink(body.magicLink);
      }
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitEmail(email);
  };

  const handleTestLogin = async () => {
    await submitEmail(TEST_USER_EMAIL);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Section>
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
                  Fan Clú
                </span>
                <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                  ¡Bienvenido/a!
                </h1>
                <p className="mb-3 text-lg text-text-secondary">
                  Iniciaste sesión como{" "}
                  <span className="text-text-primary">{user?.email}</span>.
                </p>
                <p className="mb-10 text-text-muted">
                  Contenido exclusivo próximamente.
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    void logout();
                  }}
                >
                  Cerrar sesión
                </Button>
              </div>
            </Container>
          </Section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Section>
          <Container>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
                Acceso exclusivo
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Fan Clú
              </h1>
            </div>

            <div className="grid gap-12 md:grid-cols-2 md:gap-16">
              <div>
                <p className="mb-8 text-lg leading-relaxed text-text-secondary">
                  El rincón exclusivo para los verdaderos fans de Metal Prog
                  Pop.
                </p>
                <ul className="space-y-3">
                  {[
                    "Bonus content",
                    "Behind the scenes",
                    "Notas exclusivas",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-text-secondary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      <span className="font-display text-sm font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card padding="md" className="p-8">
                {error && (
                  <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    El link es inválido o expirado. Intentá de nuevo.
                  </div>
                )}

                {submitError && (
                  <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    Hubo un error. Intentá de nuevo.
                  </div>
                )}

                {submitted ? (
                  <div className="py-4 text-center">
                    <p className="text-lg text-text-primary">
                      Si tu email está registrado, te enviamos un link de
                      acceso.
                    </p>
                    <p className="mt-4 text-sm text-text-muted">
                      Revisá tu bandeja de entrada.
                    </p>
                    {isDevShowMagicLink() && magicLink !== null && (
                      <div className="mt-6 border-t border-border pt-6 text-left">
                        <p className="mb-2 font-display text-xs uppercase tracking-widest text-brand">
                          Dev: magic link (no email sent)
                        </p>
                        <a
                          data-testid="dev-magic-link"
                          href={magicLink}
                          className="break-all text-sm text-brand underline hover:text-brand-hover"
                        >
                          {magicLink}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 className="mb-6 font-display text-xl font-semibold text-text-primary">
                      Ingresá con tu email
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-display text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={submitting}
                        className="w-full"
                      >
                        {submitting ? "Enviando..." : "Enviar magic link"}
                      </Button>
                    </form>
                    {isTestUsersEnabled() && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          void handleTestLogin();
                        }}
                        disabled={submitting}
                        data-testid="dev-test-login"
                        className="mt-3 w-full"
                      >
                        Dev: ingresar como {TEST_USER_EMAIL}
                      </Button>
                    )}
                  </>
                )}
              </Card>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
