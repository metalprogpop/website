import { Button } from "../ui/brand/Button";

type MemberWelcomeProps = {
  email: string;
  onLogout: () => void;
};

// What active subscribers and staff see until the video catalog arrives.
export function MemberWelcome({ email, onLogout }: MemberWelcomeProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
        Fan Clú
      </span>
      <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
        ¡Gracias por el aguante!
      </h1>
      <p className="mb-3 text-lg text-text-secondary">
        Entraste como <span className="text-text-primary">{email}</span>.
      </p>
      <p className="mb-10 text-text-muted">
        Muy pronto vas a encontrar acá los videos de los programas y Poné Rec™.
        Mientras tanto, seguí recibiendo el Link Supersecreto™ por email.
      </p>
      <Button variant="secondary" size="md" onClick={onLogout}>
        Cerrar sesión
      </Button>
    </div>
  );
}
