import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../ui/brand/Card";
import { Button } from "../ui/brand/Button";
import { useMagicLinkLogin } from "../../hooks/useMagicLinkLogin";
import {
  isTestUsersEnabled,
  isDevShowMagicLink,
  TEST_USER_EMAIL,
} from "../../lib/devFlags";

const errorBanner =
  "mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive";

export function LoginCard() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const { submitEmail, submitted, submitting, submitError, magicLink } =
    useMagicLinkLogin();
  const linkError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitEmail(email);
  };

  return (
    <Card padding="md" className="p-8">
      {linkError && (
        <div className={errorBanner}>
          El link es inválido o expirado. Intentá de nuevo.
        </div>
      )}

      {submitError && (
        <div className={errorBanner}>Hubo un error. Intentá de nuevo.</div>
      )}

      {submitted ? (
        <div className="py-4 text-center">
          <p className="text-lg text-text-primary">
            Si tu email está registrado, te enviamos un link de acceso.
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
          <h2 className="mb-2 font-display text-xl font-semibold text-text-primary">
            Ingresá con tu email
          </h2>
          <p className="mb-6 text-sm text-text-muted">
            ¿Ya sos parte? Te mandamos un link para entrar.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="tu@email.com"
              aria-label="Email"
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
              {submitting ? "Enviando..." : "Enviar link de acceso"}
            </Button>
          </form>
          {isTestUsersEnabled() && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                void submitEmail(TEST_USER_EMAIL);
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
  );
}
