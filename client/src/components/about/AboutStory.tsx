// Drafted from the story on aguante.metalprogpop.com; edit freely.
export function AboutStory() {
  return (
    <div className="grid gap-10 text-lg leading-relaxed text-text-secondary lg:grid-cols-2 lg:gap-16">
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Cómo empezó
        </h2>
        <p>
          Todo empezó en una sobremesa. El Dr. Ángel juntó a la troupe de
          Lecheenpolvo a comer y, entre el vino y el postre, El Colo y el Rey
          Tut se pusieron a discutir bandas, temas y discos. Datos, retrucos y
          anécdotas volaban de un lado al otro de la mesa, y el resto lloraba de
          risa.
        </p>
        <p>Unos días después llegó la propuesta:</p>
        <blockquote className="border-l-4 border-brand pl-4 font-display text-xl text-text-primary">
          Che... ¿Y si lo grabamos y lo subimos?
        </blockquote>
        <p>
          El primer episodio salió en diciembre de 2017. Desde entonces vamos
          rotando: un disco de metal, uno de prog y uno de pop. El que lo trae
          cuenta su historia y lo defiende; los otros dos opinan, a veces con
          amor y a veces sin ninguna piedad.
        </p>
        <p>
          Detrás de escena está Santi Grillo, el cuarto integrante: las tapas,
          las imágenes y toda la magia que no se escucha pero se ve.
        </p>
      </div>
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Por qué lo hacemos
        </h2>
        <p>
          Porque nos encanta la música y nos encanta discutirla. Porque hay
          discos enormes que el tiempo dejó en un cajón y se merecen otra
          vuelta. Porque escuchar algo que nunca hubieras elegido es la mejor
          manera de descubrir algo nuevo, aunque lo nuevo sea que lo odiás.
        </p>
        <p>
          Y porque es la excusa perfecta para seguir juntándonos entre amigos.
          MetalProgPop es, antes que nada, una celebración de la amistad
          melómana. Si te reís con nosotros, si descubriste un disco gracias a
          un episodio o si te aburriste como El Colo escuchando The Flower
          Kings, ya sos parte.
        </p>
      </div>
    </div>
  );
}
