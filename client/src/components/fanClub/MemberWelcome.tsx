import { Button } from "../ui/brand/Button";
import { VideoHub } from "./videos/VideoHub";

type MemberWelcomeProps = {
  email: string;
  onLogout: () => void;
};

// What active subscribers and staff see: the program videos.
export function MemberWelcome({ email, onLogout }: MemberWelcomeProps) {
  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
            Fan Clú
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            ¡Gracias por el aguante!
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 text-sm text-text-muted">
          <span>
            Entraste como <span className="text-text-primary">{email}</span>
          </span>
          <Button variant="ghost" size="sm" className="px-0" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
      <VideoHub />
    </>
  );
}
