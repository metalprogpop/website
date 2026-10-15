import { useHallOfFans } from "../../hooks/useHallOfFans";

// Different people can share a name, so each one is keyed by its name and
// how many times that name came before it.
const withKeys = (names: string[]) => {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return { key: `${name}#${count}`, name };
  });
};

export function HallOfFans() {
  const { data: names, isLoading, isError } = useHallOfFans();

  return (
    <section aria-labelledby="hall-of-fans" className="text-center">
      <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
        Gracias por siempre
      </span>
      <h2
        id="hall-of-fans"
        className="mb-4 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
      >
        Hall of Fans de MetalProgPop Cast™
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-lg text-text-secondary">
        Estas personas hermosas son quienes con su aporte nos ayudan a hacer
        esto y poder compartirlo con todo el mundo.
      </p>
      {isLoading && (
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      )}
      {isError && (
        <p className="text-text-muted">
          No pudimos cargar el Hall of Fans. Probá de nuevo en un rato.
        </p>
      )}
      {names?.length === 0 && (
        <p className="text-text-muted">Todavía no hay nadie en la lista.</p>
      )}
      {names && names.length > 0 && (
        <ul className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-2 font-display text-text-primary">
          {withKeys(names).map(({ key, name }) => (
            <li key={key}>{name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
