import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import { FanClubHome } from "../components/fanClub/FanClubHome";
import { HallOfFans } from "../components/fanClub/HallOfFans";
import { MemberWelcome } from "../components/fanClub/MemberWelcome";
import { useAuth } from "../hooks/useAuth";

export function FanCluPage() {
  const { user, isLoading, logout } = useAuth();
  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Section>
          <Container>
            {isLoading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
              </div>
            ) : user?.fanClubAccess ? (
              <MemberWelcome email={user.email} onLogout={handleLogout} />
            ) : (
              <FanClubHome user={user} onLogout={handleLogout} />
            )}
          </Container>
        </Section>
        <Section>
          <Container>
            <HallOfFans />
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
