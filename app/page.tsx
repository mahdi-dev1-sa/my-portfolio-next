"use client";
import dynamic from "next/dynamic";
import Hero from "./components/Hero";
import ServiceCards from "./components/ServiceCards";
import Story from "./components/Story";
import Contact from "./components/Contact";
import DoorRush from "./components/DoorRush";

// three.js is big, so load it in the browser only (never on the server)
const ParticleField = dynamic(() => import("./components/ParticleField"), { ssr: false });

export default function Home() {
  return (
    <main id="home" className="relative min-h-screen overflow-clip pb-20">
      <ParticleField />
      {/* a click on a specialization in the nav: rush down to the doors, open the door, walk in */}
      <DoorRush />

      <div className="relative z-10">
        {/* first screen: name + 3D carousel of glass cards with my specializations */}
        <Hero />

        <div className="mx-auto max-w-5xl px-6">
          {/* glass cards: my specializations */}
          <ServiceCards />
        </div>

        {/* my story: after the doors, like in the menu */}
        <Story />

        {/* contact: form + WhatsApp + email */}
        <Contact />
      </div>
    </main>
  );
}
