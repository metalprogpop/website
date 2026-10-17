import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { AboutStory } from "../components/about/AboutStory";
import { MemberCard } from "../components/about/MemberCard";
import { LecheenpolvoVideos } from "../components/about/LecheenpolvoVideos";
import { Appearances } from "../components/about/Appearances";
import { appearances, members } from "../data/about";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Section>
          <Container>
            <div className="mb-16 text-center">
              <span className="animate-on-load animate-fade-up mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
                Nosotros
              </span>
              <h1 className="animate-on-load animate-fade-up delay-200 mb-6 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-6xl">
                Tres fanáticos, tres mundos y un micrófono
              </h1>
              <p className="animate-on-load animate-fade-up delay-300 mx-auto max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">
                Cada episodio, uno de nosotros trae un disco icónico de su
                mundo. Contamos su historia y sus anécdotas, y lo discutimos sin
                diplomacia. Decimos lo que pensamos.
              </p>
            </div>
            <AboutStory />
          </Container>
        </Section>
        <Section>
          <Container>
            <section aria-labelledby="team">
              <div className="mb-12 text-center">
                <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
                  Metal, prog, pop y cast
                </span>
                <h2
                  id="team"
                  className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
                >
                  Quiénes somos
                </h2>
              </div>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {members.map((member) => (
                  <li key={member.instagram}>
                    <MemberCard member={member} />
                  </li>
                ))}
              </ul>
            </section>
          </Container>
        </Section>
        <Section>
          <Container>
            <LecheenpolvoVideos />
          </Container>
        </Section>
        {appearances.length > 0 && (
          <Section>
            <Container>
              <Appearances />
            </Container>
          </Section>
        )}
      </main>
      <Footer />
    </div>
  );
}
