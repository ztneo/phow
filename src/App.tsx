import { useEffect, useRef } from "react";

function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="logo" href="#top">
          <span className="logo-mark">◆</span>
          Phow
        </a>
        <nav className="main-nav" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#showcase">Showcase</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="header-cta">
          <a className="btn btn-ghost" href="#cta">
            Sign in
          </a>
          <a className="btn btn-primary" href="#cta">
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" />
      <div className="container">
        <span className="hero-badge">✦ Violet-first design</span>
        <h1>
          See further in the <span className="gradient-text">violet</span>.
        </h1>
        <p className="hero-sub">
          Phow is a polished purple experience: a product surface that treats
          violet as a first-class brand color, not an afterthought.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#cta">
            Start with purple →
          </a>
          <a className="btn btn-ghost" href="#features">
            Explore the palette
          </a>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: "◈",
      title: "Violet design tokens",
      body: "A full 50–950 violet ramp wired through CSS custom properties, so every surface stays on-brand.",
    },
    {
      icon: "◉",
      title: "Glow & depth",
      body: "Layered radial gradients and soft glows give sections real depth without heavy imagery.",
    },
    {
      icon: "▲",
      title: "Responsive by default",
      body: "Fluid type, wrapping grids, and a collapsing nav keep the layout sharp on any screen.",
    },
    {
      icon: "❖",
      title: "Motion with taste",
      body: "Subtle scroll-reveal animations that respect prefers-reduced-motion out of the box.",
    },
    {
      icon: "⬢",
      title: "Fast & static",
      body: "A Vite-powered static build: instant loads, clean deploys, no server to babysit.",
    },
    {
      icon: "✶",
      title: "Easy to extend",
      body: "Sections are plain components — swap copy, reorder blocks, or bolt on new pages quickly.",
    },
  ];

  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Features</span>
          <h2>Everything speaks violet</h2>
          <p>
            From buttons to borders, one consistent purple system carries the
            whole page.
          </p>
        </div>
        <div className="card-grid">
          {items.map((item) => (
            <article className="card reveal" key={item.title}>
              <div className="card-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  return (
    <section className="showcase section" id="showcase">
      <div className="container showcase-inner">
        <div className="reveal">
          <span className="eyebrow">Showcase</span>
          <h2>A design system that stays in the purple family</h2>
          <p>
            One palette, many surfaces. This band pairs a soft violet panel
            with stat cards to show how the theme scales from copy to data.
          </p>
          <div className="stat-row">
            <div className="stat">
              <b>50–950</b>
              <span>violet ramp</span>
            </div>
            <div className="stat">
              <b>100%</b>
              <span>fluid layout</span>
            </div>
            <div className="stat">
              <b>6</b>
              <span>sections</span>
            </div>
            <div className="stat">
              <b>0</b>
              <span>UI framework deps</span>
            </div>
          </div>
        </div>
        <div className="showcase-panel reveal">
          <div className="panel-bar">
            <span />
            <span />
            <span />
          </div>
          <pre className="code-lines">
            <span className="cmt">{"// theme.ts — violet ramp"}</span>
            {"\n"}
            <span className="kw">const</span> violet = {"{"}
            {"\n"}
            {"  "}50: <span className="str">"#f5f3ff"</span>,{"\n"}
            {"  "}500: <span className="str">"#8b5cf6"</span>,{"\n"}
            {"  "}950: <span className="str">"#1e0a3c"</span>,{"\n"}
            {"}"};
          </pre>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const steps = [
    {
      title: "Pick your violets",
      body: "Start from the 50–950 ramp in index.css and tune the three brand stops to taste.",
    },
    {
      title: "Compose sections",
      body: "Hero, features, showcase, steps, CTA — each is a small component you can reorder freely.",
    },
    {
      title: "Ship it static",
      body: "One vite build produces a dist folder that deploys anywhere, purple included.",
    },
  ];

  return (
    <section className="section" id="how">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">How it works</span>
          <h2>Three steps to violet</h2>
          <p>Everything is plain components and CSS variables — no magic.</p>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <article className="step reveal" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="section" id="cta">
      <div className="container">
        <div className="cta-band reveal">
          <h2>Ready to live in violet?</h2>
          <p>
            Start from this purple foundation and make it yours — the palette,
            the glow, and the motion are all yours to tune.
          </p>
          <a className="btn btn-primary" href="#top">
            Back to the top ↑
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} Phow — built in violet.</p>
        <nav className="footer-links" aria-label="Footer">
          <a href="#features">Features</a>
          <a href="#showcase">Showcase</a>
          <a href="#how">How it works</a>
        </nav>
      </div>
    </footer>
  );
}

export default function App() {
  const ref = useRevealOnScroll();
  return (
    <div ref={ref}>
      <Header />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <Steps />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
