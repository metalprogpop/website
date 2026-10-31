import { Link, Navigate } from "react-router-dom";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { PoneRecCatalog } from "../components/fanClub/poneRec/PoneRecCatalog";
import { useAuth } from "../hooks/useAuth";

// Poné Rec™, the Fan Clú's bonus podcast. Members only; everyone else goes
// to the Fan Clú's home.
export function PoneRecPage() {
  const { user, isLoading } = useAuth();
  if (!isLoading && !user?.fanClubAccess) {
    return <Navigate to="/fan-clu" replace />;
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Section>
          <Container>
            <Link
              to="/fan-clu"
              className="font-display text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              ← Fan Clú
            </Link>
            <div className="mb-10 mt-4">
              <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
                Fan Clú
              </span>
              <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                Poné Rec™
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-text-secondary">
                El podcast adicional, solo para el Fan Clú.
              </p>
            </div>
            {isLoading ? (
              <div className="flex min-h-[30vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
              </div>
            ) : (
              <PoneRecCatalog />
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
