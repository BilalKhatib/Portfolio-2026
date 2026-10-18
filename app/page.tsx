import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SideRail } from "@/components/layout/side-rail";
import { RevealController } from "@/components/layout/reveal-controller";
import { Hero } from "@/components/hero/hero";
import { About } from "@/components/sections/about";
import { Projects } from "@/components/sections/projects";
import { Security } from "@/components/sections/security";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Contact } from "@/components/sections/contact";
import { OverlayMount } from "@/components/three/overlay-mount";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Security />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <SideRail />
      <RevealController />
      <OverlayMount />
    </>
  );
}
