/**
 * Single source of truth for every personal detail on the site.
 *
 * Only real, verified information belongs here. Arrays left empty render an
 * honest "in progress" state rather than placeholder claims, so the site
 * never shows invented experience, credentials, or statistics.
 *
 * Items marked CONFIRM came from the original concept and should be
 * confirmed (or removed) by Bilal.
 */

export type Stat = { value: string; label: [string, string] };

export type Project = {
  title: string;
  summary: string;
  stack: string[];
  links?: { live?: string; repo?: string; caseStudy?: string };
};

export type SkillGroup = { title: string; items: string[] };

export type ExperienceItem = {
  role: string;
  organization: string;
  period: string;
  summary: string;
};

export type Social = { label: "GitHub" | "LinkedIn" | "Email" | "Website"; href: string };

export type FocusArea = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  /** Fallback illustration from the asset package (svg/projects) */
  poster: string;
};

export type SecurityStage = { title: string; text: string; tone: "cyan" | "red" };

export const profile = {
  name: { first: "Bilal", last: "Khatib", full: "Bilal Khatib" },
  greeting: "Hello, I'm",
  roles: { line1: "Software Engineer &", line2: "Cybersecurity Enthusiast" },
  tagline: "Building secure digital experiences.",
  /** Used for <title> and social previews */
  description: "Bilal Khatib — Software Engineer & Cybersecurity Enthusiast building secure digital experiences.",
  /** Absolute production URL, e.g. "https://bilalkhatib.dev". Enables canonical/OG URLs. */
  siteUrl: "",

  /** CONFIRM: shown in the header as in the concept. Set `show: false` if not looking. */
  availability: { show: true, label: "Available for opportunities", href: "#contact" },

  /**
   * Verified numbers only (e.g. { value: "4", label: ["Projects", "Shipped"] }).
   * The concept's "3+ years / 10+ projects" were mockup values, so this is empty.
   */
  stats: [] as Stat[],

  terminal: {
    path: "~/portfolio",
    command: "whoami",
    lines: ["Software Engineer", "Cybersecurity Enthusiast", "Problem Solver", "Building a safer internet..."],
  },

  /** Focus areas from the concept's six hero cards (themes, not claims). */
  focusAreas: [
    { id: "cicd", title: "Secure CI/CD", blurb: "Automated & Secure Deployments", href: "#projects", poster: "/images/svg/projects/secure-cicd.svg" },
    { id: "web", title: "Web Applications", blurb: "Modern, Scalable Solutions", href: "#projects", poster: "/images/svg/projects/web-apps.svg" },
    { id: "vuln", title: "Vulnerability Analysis", blurb: "Find. Fix. Prevent.", href: "#security", poster: "/images/svg/projects/vulnerability.svg" },
    { id: "automation", title: "Automation", blurb: "Tools that save time & increase security", href: "#projects", poster: "/images/svg/projects/automation.svg" },
    { id: "api", title: "API Security", blurb: "Stronger Systems. Safer Data.", href: "#security", poster: "/images/svg/projects/api-security.svg" },
    { id: "portfolio", title: "Portfolio Projects", blurb: "Ideas into Real Experiences", href: "#projects", poster: "/images/svg/projects/projects.svg" },
  ] satisfies FocusArea[],

  about: {
    /** Short positioning line built only from the concept's own copy. */
    intro: "Software engineer and cybersecurity enthusiast focused on building secure digital experiences.",
    /** Add your own bio paragraphs here. */
    paragraphs: [] as string[],
    location: "",
  },

  /** The HUD's DETECT / ANALYZE / AUTOMATE / SECURE loop. CONFIRM wording. */
  security: {
    heading: "Security everywhere",
    lede: "Real threats need real solutions. Security is treated as part of how software is built, not a step bolted on at the end.",
    stages: [
      { title: "Detect", text: "Surface weak points early, in code, dependencies and configuration.", tone: "cyan" },
      { title: "Analyze", text: "Understand impact and root cause before deciding on a fix.", tone: "cyan" },
      { title: "Automate", text: "Turn repeatable checks into tooling and pipeline steps.", tone: "cyan" },
      { title: "Secure", text: "Fix, verify, and keep it fixed.", tone: "red" },
    ] satisfies SecurityStage[],
  },

  projects: [] as Project[],
  skills: [] as SkillGroup[],
  experience: [] as ExperienceItem[],

  contact: {
    heading: "Let's build something great.",
    /** Public contact address, e.g. "hello@example.com". */
    email: "",
    socials: [] as Social[],
  },

  /** Path or URL to a résumé PDF, e.g. "/bilal-khatib-resume.pdf". */
  resumeUrl: "",

  footerMotto: ["Build", "Hack", "Secure", "Repeat"],
};

export const sections = [
  { id: "hero", label: "Hero", nav: "Home" },
  { id: "about", label: "About", nav: "About" },
  { id: "projects", label: "Projects", nav: "Projects" },
  { id: "security", label: "Security", nav: "Security" },
  { id: "skills", label: "Skills", nav: "Skills" },
  { id: "experience", label: "Experience", nav: null },
  { id: "contact", label: "Contact", nav: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
