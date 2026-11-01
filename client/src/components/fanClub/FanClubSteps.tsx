const steps = [
  {
    title: "Elegís cuánto aportar por mes",
    text: "Con Mercado Pago, en pesos. Si estás fuera de Argentina, con Patreon. Lo das de baja cuando quieras desde ahí mismo.",
  },
  {
    title: "Entrás con tu email",
    text: "El mismo con el que aportás. Te mandamos un link para entrar, sin contraseñas.",
  },
  {
    title: "Listo, ya sos parte",
    text: "Los videos y Poné Rec™ te esperan acá. Si te acabás de sumar, puede tardar unos días en activarse.",
  },
];

// How joining works, from paying to watching.
export function FanClubSteps() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary">
        Cómo funciona
      </h2>
      <ol className="space-y-5">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-text-primary font-display font-bold text-white"
            >
              {index + 1}
            </span>
            <span className="text-lg leading-relaxed">
              <span className="block font-display font-semibold text-text-primary">
                {step.title}
              </span>
              <span className="text-text-secondary">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
