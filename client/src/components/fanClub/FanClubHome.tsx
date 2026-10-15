import type { MeResponse } from "shared";
import { FanClubStory } from "./FanClubStory";
import { LoginCard } from "./LoginCard";
import { SignedInCard } from "./SignedInCard";
import { SupportOptions } from "./SupportOptions";

type FanClubHomeProps = {
  user: MeResponse | null;
  onLogout: () => void;
};

// The public home: why to join and how, beside the login form (or, for a
// signed-in fan without an active subscription, a note on how to get one).
export function FanClubHome({ user, onLogout }: FanClubHomeProps) {
  return (
    <>
      <div className="mb-12 text-center">
        <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
          Llegaste. Es acá
        </span>
        <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Fan Clú
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-text-secondary">
          Nosotros tampoco lo podemos creer. Pero acá estamos y acá estás.
        </p>
      </div>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
        <div className="space-y-16">
          <FanClubStory />
          <SupportOptions />
        </div>
        {/* On phones the login comes first, so members needn't scroll past the pitch. */}
        <div className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
          {user ? (
            <SignedInCard email={user.email} onLogout={onLogout} />
          ) : (
            <LoginCard />
          )}
        </div>
      </div>
    </>
  );
}
