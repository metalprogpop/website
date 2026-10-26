import type { ReactNode } from "react";
import { Header } from "../../landing/Header";
import { Footer } from "../../landing/Footer";
import { Container } from "../../layout/Container";
import { Section } from "../../layout/Section";

// The program page's frame: the site's shell with tighter spacing, so the
// player sits close to the header (theater mode).
export function ProgramPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Section className="!py-6 lg:!py-10">
          <Container width="wide">{children}</Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
    </div>
  );
}
