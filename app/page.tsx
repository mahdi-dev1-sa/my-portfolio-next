"use client";
import dynamic from "next/dynamic";
import Hero from "./components/Hero";
import ServiceCards from "./components/ServiceCards";
import Story from "./components/Story";

// three.js is big, so load it in the browser only (never on the server)
const ParticleField = dynamic(() => import("./components/ParticleField"), { ssr: false });

export default function Home() {
  return (
    <main id="home" className="relative min-h-screen overflow-clip pb-20">
      <ParticleField />

      <div className="relative z-10">
        {/* first screen: name + 3D carousel of glass cards with my specializations */}
        <Hero />

        <div className="mx-auto max-w-5xl px-6">
          {/* glass cards: my specializations */}
          <ServiceCards />
        </div>

        {/* my story: after the doors, like in the menu */}
        <Story />
      </div>
    </main>
  );
}
