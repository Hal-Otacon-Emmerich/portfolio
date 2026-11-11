import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { portfolioApi } from '../api/portfolio';
import { Contact } from '../components/Contact';
import { ExperienceSection } from '../components/ExperienceSection';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Projects } from '../components/Projects';
import { Stack } from '../components/Stack';
import { useResource } from '../hooks/useResource';
import { scrollToSection } from '../lib/sections';

export function HomePage() {
  const profile = useResource((s) => portfolioApi.getProfile(s), []);
  const projects = useResource((s) => portfolioApi.getProjects(s), []);
  const stack = useResource((s) => portfolioApi.getStack(s), []);
  const experience = useResource((s) => portfolioApi.getExperience(s), []);
  const { hash } = useLocation();

  const ready = !profile.loading && !projects.loading && !stack.loading && !experience.loading;

  // Переход вида /#projects (например, «Назад к проектам»): ждём данные, чтобы высоты секций устоялись.
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    if (ready) scrollToSection(decodeURIComponent(hash.slice(1)), 'auto');
  }, [hash, ready]);

  return (
    <div className="page">
      <Header profile={profile.data} />
      <main>
        {profile.data && <Hero profile={profile.data} />}
        <Projects state={projects} />
        <Stack state={stack} />
        <ExperienceSection state={experience} />
        {profile.data && <Contact profile={profile.data} />}
      </main>
    </div>
  );
}
