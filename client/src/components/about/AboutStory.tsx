import { lecheenpolvoChannel } from "../../data/about";

// Guido's own words from aguante.metalprogpop.com, copied verbatim. Don't
// rewrite them.
export function AboutStory() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-text-secondary">
      <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
        Cómo empezó
      </h2>
      <p>
        Resulta que un día, como ser humano del bien que es, el Dr. Appiani
        decidió reunir a la troupe de{" "}
        <a
          href={lecheenpolvoChannel}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          Lecheenpolvo
        </a>{" "}
        en memorable comilona. Entre los presentes se encontraban, por supuesto,
        El Colo y el Rey Tut. Y sucedió que en la sobremesa surgió el debate de
        bandas, temas y discos que amaríamos homenajear con el proyecto.
      </p>
      <p>
        La charla devino en una tormenta de datos, retrucos y <em>anedas</em> de
        sus artistas más amados que los susodichos se arrojaron y rearrojaron
        para el deleite del resto de los presentes. Y por deleite nos referimos
        a carcajadas de ésas que hacen salir el vino por la nariz. Grandes
        momentos. Tal fue el éxito de la tertulia que unos días más tarde el
        Doctor comunicose con Mr. Colo y Mr. Tut con la propuesta:
      </p>
      <blockquote className="border-l-4 border-brand pl-4 font-display text-xl font-bold italic text-text-primary">
        Che... ¿Y si lo grabamos y los subimos?
      </blockquote>
      <p>
        Así comenzó <em>MetalProgPop Cast</em> a fines de 2017. Ahora es cuando
        mirás el almanaque y sacás la cuenta de cuánto tiempo hace que estamos
        con esta locura. Una locura que se ama fuerte. No vamos a engañarnos:
        nos divertimos mucho. Nos encanta hacerlo y queremos poder seguir
        haciéndolo un montón de tiempo más. Nos encanta saber que estás del otro
        lado, que te reís con nosotros, que te sorprendés descubriendo discos
        olvidados o te aburrís como El Colo cuando lo obligan a escuchar The
        Flower Kings.
      </p>
    </div>
  );
}
