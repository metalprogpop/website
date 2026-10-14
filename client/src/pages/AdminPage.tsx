import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { Card } from "../components/ui/brand/Card";
import { SubscribersPanel } from "../components/admin/SubscribersPanel";
import { useAuth } from "../hooks/useAuth";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export function AdminPage() {
  const { isLoading, isStaff } = useAuth();

  if (isLoading) {
    return (
      <Shell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      </Shell>
    );
  }

  // Same answer as the API for anyone who is not staff: nothing here.
  if (!isStaff) {
    return (
      <Shell>
        <Section>
          <Container>
            <div className="text-center">
              <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Página no encontrada
              </h1>
            </div>
          </Container>
        </Section>
      </Shell>
    );
  }

  return (
    <Shell>
      <Section>
        <Container width="wide">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
                Admin
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Suscriptores
              </h1>
            </div>
          </div>
          <Card padding="md">
            <SubscribersPanel />
          </Card>
        </Container>
      </Section>
    </Shell>
  );
}
