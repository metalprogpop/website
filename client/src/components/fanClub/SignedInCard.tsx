import { Card } from "../ui/brand/Card";
import { Button } from "../ui/brand/Button";

type SignedInCardProps = {
  email: string;
  onLogout: () => void;
};

// For a signed-in fan whose email has no active subscription.
export function SignedInCard({ email, onLogout }: SignedInCardProps) {
  return (
    <Card padding="md" className="p-8">
      <h2 className="mb-4 font-display text-xl font-semibold text-text-primary">
        Iniciaste sesión
      </h2>
      <p className="mb-3 text-text-secondary">
        Entraste como <span className="text-text-primary">{email}</span>.
      </p>
      <p className="mb-6 text-sm text-text-muted">
        Este email no tiene una suscripción activa. Sumate al Fan Clú con
        alguno de los botones de esta página; si te suscribiste con otro email,
        entrá con ese. Si te acabás de sumar, puede tardar unos días en
        activarse.
      </p>
      <Button
        variant="secondary"
        size="md"
        onClick={onLogout}
        className="w-full"
      >
        Cerrar sesión
      </Button>
    </Card>
  );
}
