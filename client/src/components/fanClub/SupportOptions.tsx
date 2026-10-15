import { Card } from "../ui/brand/Card";
import { ButtonLink } from "../ui/brand/Button";
import { fanClubLinks } from "../../data/fanClub";

const benefits = [
  "Tu nombre inmortalizado en piedra (bueno, en bytes) en el Hall of Fans, al final de esta página.",
  "Ser fan destacado de uno de nuestros programas, con mención al aire y todo eso.",
  "Con cada programa nuevo te llega un email con el Link Supersecreto™ para ver los videos de los programas y el podcast adicional: Poné Rec™.",
];

const checkout = { target: "_blank", rel: "noreferrer" } as const;

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
          mensualmente unos pesitos; lo que puedas está bien. Todo contribuye,
          además de para cubrir la logística propia del programa, para que nunca
          nos falte el whisky 🥃. Posta, todo suma un montón. Y si lo hacés,
          queremos retribuírtelo.
        </p>
        <p>Es simple: con un modestísimo aporte mensual obtenés:</p>
        <ul className="space-y-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-3">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

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
        <p>
          Cada nivel incluye las recompensas (?) de los anteriores: si te
          suscribís al nivel LONG PLAY, tenés todo lo de SINGLE.
        </p>
        <p>
          Si aportás un monto definido por vos, recibís lo del nivel cuyo monto
          es el inmediato anterior a tu aporte. Por ejemplo, si tu aporte no
          llega al de LONG PLAY, cuenta como SINGLE.
        </p>
      </div>
    </div>
  );
}
