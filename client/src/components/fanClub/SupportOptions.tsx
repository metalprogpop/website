import { Card } from "../ui/brand/Card";
import { ButtonLink } from "../ui/brand/Button";
import { fanClubLinks } from "../../data/fanClub";
import { FanClubPerks } from "./FanClubPerks";
import { FanClubSteps } from "./FanClubSteps";

const checkout = { target: "_blank", rel: "noreferrer" } as const;

// The pitch: how the contributions work (Guido's words from the old
// aguante.metalprogpop.com page), what members get and how to join.
export function SupportOptions() {
  return (
    <div className="space-y-10">
      <div className="space-y-5 text-lg leading-relaxed text-text-secondary">
        <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary">
          ¿Cómo hacernos el aguante?
        </h2>
        <p>
          Además de agitando en la Sección Quejas™ (que nos encanta) o
          compartiendo lo que hacemos, podés brindar tu aguante aportando
          mensualmente con unos pesitos; lo que puedas está bien. Todo
          contribuye, además de para cubrir la logística propia del programa,
          para que nunca nos falte el whisky 🥃. Posta todo suma un montón. Y si
          lo hacés, queremos retribuírtelo.
        </p>
        <p>Es simple: un modestísimo aporte mensual y obtenés:</p>
      </div>

      <FanClubPerks />

      <FanClubSteps />

      <Card padding="md" className="p-8 text-center">
        <h3 className="mb-2 font-display text-2xl font-bold tracking-tight text-text-primary">
          ¿Entonces? ¿Le hacés el aguante a MetalProgPop?
        </h3>
        <p className="mb-6 text-text-secondary">
          Obvio que sí, así que tocá este botón y dale para adelante:
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            href={fanClubLinks.mercadoPagoSingle}
            size="lg"
            {...checkout}
          >
            ARS 5000
          </ButtonLink>
          <ButtonLink
            href={fanClubLinks.mercadoPagoCustom}
            variant="secondary"
            size="lg"
            {...checkout}
          >
            Otro monto
          </ButtonLink>
        </div>
        <p className="mt-3 text-sm text-text-muted">
          O el monto que quieras...
        </p>
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-3 text-text-secondary">¿Estás fuera de Argentina?</p>
          <ButtonLink
            href={fanClubLinks.patreon}
            variant="secondary"
            {...checkout}
          >
            Sumate en Patreon
          </ButtonLink>
        </div>
      </Card>

      <div className="space-y-2 text-sm text-text-muted">
        <p className="font-display font-semibold text-text-secondary">
          La letra chica
        </p>
        <p>Todos los importes están expresados en pesos argentinos.</p>
      </div>
    </div>
  );
}
