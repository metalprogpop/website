import { fanClubLinks } from "../../data/fanClub";

const linkClass = "text-brand underline hover:text-brand-hover";

// Ported from the old aguante.metalprogpop.com page.
export function FanClubStory() {
  return (
    <div className="space-y-5 text-lg leading-relaxed text-text-secondary">
      <p className="font-display text-2xl font-semibold text-text-primary">
        Ante todo: ¡gracias!
      </p>
      <p>
        Por tu tiempo, y por darnos una oportunidad de contarte por qué hacemos
        esto.
      </p>
      <p>
        Resulta que un día, como ser humano del bien que es, el Dr. Appiani
        decidió reunir a la troupe de{" "}
        <a
          href={fanClubLinks.lecheenpolvo}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          Lecheenpolvo
        </a>{" "}
        en memorable comilona. Entre los presentes se encontraban, por supuesto,
        El Colo y el Rey Tut. Y sucedió que en la sobremesa surgió el debate de
        bandas, temas y discos que amaríamos homenajear con el proyecto.
      </p>
      <p>
        La charla devino en una tormenta de datos, retrucos y anécdotas de sus
        artistas más amados que los susodichos se arrojaron y rearrojaron para
        el deleite del resto de los presentes. Y por deleite nos referimos a
        carcajadas de ésas que hacen salir el vino por la nariz. Grandes
        momentos. Tal fue el éxito de la tertulia que unos días más tarde el
        Doctor comunicose con Mr. Colo y Mr. Tut con la propuesta:
      </p>
      <blockquote className="border-l-4 border-brand pl-4 font-display text-xl text-text-primary">
        Che... ¿Y si lo grabamos y lo subimos?
      </blockquote>
      <p>
        Así comenzó MetalProgPop Cast a fines de 2017. Ahora es cuando mirás el
        almanaque y sacás la cuenta de cuánto tiempo hace que estamos con esta
        locura. Una locura que se ama fuerte. No vamos a engañarnos: nos
        divertimos mucho. Nos encanta hacerlo y queremos poder seguir haciéndolo
        un montón de tiempo más. Nos encanta saber que estás del otro lado, que
        te reís con nosotros, que te sorprendés descubriendo discos olvidados o
        te aburrís como El Colo cuando lo obligan a escuchar The Flower Kings.
      </p>
      <p>
        Es por eso que, si disfrutás de lo que hacemos, te gusta que te
        acompañemos como nos sale, y te querés hacer colaborador para que esta
        celebración de la amistad melómana siga creciendo, te invitamos a que
        nos hagas el aguante.
      </p>
    </div>
  );
}
