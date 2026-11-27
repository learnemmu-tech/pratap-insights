export const sampleCategories = [
  { slug: "anesthesiology", name: "Anesthesiology", description: "Sample notes on monitoring, airway care and perioperative practice." },
  { slug: "clinical-practice", name: "Clinical Practice", description: "Sample writing on everyday clinical decisions and bedside reasoning." },
  { slug: "medical-education", name: "Medical Education", description: "Sample pieces on teaching, learning and clinical reasoning." },
  { slug: "research-evidence", name: "Research & Evidence", description: "Sample explainers on reading studies and interpreting evidence." },
  { slug: "patient-safety", name: "Patient Safety", description: "Sample discussions of handovers, checklists and safer systems." },
  { slug: "healthcare-perspectives", name: "Healthcare Perspectives", description: "Sample commentary on how care is organised and experienced." },
  { slug: "professional-development", name: "Professional Development", description: "Sample reflections on learning habits and professional growth." },
  { slug: "technology-ai", name: "Technology & AI in Healthcare", description: "Sample introductions to digital tools in clinical work." },
] as const;

const notice = "Sample educational text for previewing the site. It is not clinical advice, and the author label is fictional.";

function doc(paragraphs: string[]) {
  return {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: notice }] },
      ...paragraphs.map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
    ],
  };
}

export const sampleArticles = [
  { slug: "depth-of-anesthesia-monitoring", title: "Depth of anesthesia monitoring: reading the numbers in context", excerpt: "A sample explainer of why one index rarely tells the whole clinical story.", category: "anesthesiology", author: "Sample Editorial", date: "2026-11-22", featured: true, image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80", alt: "Clinician reviewing a monitor" },
  { slug: "airway-planning-before-induction", title: "Airway planning before induction: a sample teaching note", excerpt: "How a short pre-induction pause can make an airway plan easier to follow.", category: "anesthesiology", author: "Sample Contributor", date: "2026-11-08", featured: false, image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1600&q=80", alt: "Hospital corridor" },
  { slug: "sepsis-recognition-first-hour", title: "Sepsis recognition in the first hour: a practical sample review", excerpt: "Early signs, escalation and common pitfalls, written as sample teaching material.", category: "clinical-practice", author: "Sample Contributor", date: "2026-11-19", featured: false, image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1600&q=80", alt: "Laboratory glassware" },
  { slug: "chest-pain-bedside-questions", title: "Five bedside questions that shape a chest-pain assessment", excerpt: "A sample outline of the questions that change the next clinical step.", category: "clinical-practice", author: "Sample Editorial", date: "2026-10-28", featured: false, image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80", alt: "Conversation in a clinic" },
  { slug: "teaching-clinical-reasoning", title: "Teaching clinical reasoning beyond the textbook", excerpt: "Sample ideas for helping learners explain why they chose the next step.", category: "medical-education", author: "Sample Contributor", date: "2026-11-17", featured: false, image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80", alt: "Tablet used during a discussion" },
  { slug: "feedback-after-a-ward-round", title: "Feedback after a ward round: keeping it specific", excerpt: "A sample note on short, concrete feedback that learners can use the same day.", category: "medical-education", author: "Sample Editorial", date: "2026-10-14", featured: false, image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1600&q=80", alt: "Notebook and pen" },
  { slug: "reading-a-clinical-trial", title: "Reading a clinical trial critically: five questions worth asking", excerpt: "Sample questions for separating a headline result from what the study can support.", category: "research-evidence", author: "Sample Contributor", date: "2026-11-20", featured: true, image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=80", alt: "Laboratory research bench" },
  { slug: "effect-sizes-beyond-p-values", title: "Understanding effect sizes beyond the p-value", excerpt: "A sample reminder that statistical significance and clinical importance are not the same.", category: "research-evidence", author: "Sample Editorial", date: "2026-11-15", featured: false, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80", alt: "Charts on a laptop" },
  { slug: "safer-perioperative-handover", title: "Designing safer perioperative care: what systems thinking adds to clinical vigilance", excerpt: "Individual expertise matters, but safety is built into processes. A look at how checklists, handovers and team communication shape the way care is delivered.", category: "patient-safety", author: "Sample Editorial", date: "2026-11-24", featured: true, image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80", alt: "Operating theatre lights", rich: true },
  { slug: "medication-checks-that-stick", title: "Medication checks that teams actually complete", excerpt: "Sample observations on why a safety step fails when it is added without a clear owner.", category: "patient-safety", author: "Sample Contributor", date: "2026-10-21", featured: false, image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80", alt: "Medicine bottles on a shelf" },
  { slug: "what-data-literacy-asks", title: "What data literacy asks of a modern clinician", excerpt: "A sample perspective on dashboards, registries and published numbers.", category: "healthcare-perspectives", author: "Sample Contributor", date: "2026-11-05", featured: false, image: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=1600&q=80", alt: "Hospital exterior" },
  { slug: "uncertainty-in-clinical-teaching", title: "Why uncertainty deserves a place in clinical teaching", excerpt: "A sample viewpoint on showing learners how experienced clinicians hold doubt.", category: "healthcare-perspectives", author: "Sample Editorial", date: "2026-11-12", featured: false, image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=80", alt: "Stethoscope on a desk" },
  { slug: "habit-of-lifelong-learning", title: "A sustainable habit of lifelong learning in medicine", excerpt: "Sample routines for keeping up without turning reading into a second job.", category: "professional-development", author: "Sample Contributor", date: "2026-11-02", featured: false, image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80", alt: "Books on a library shelf" },
  { slug: "writing-a-case-discussion", title: "The quiet value of a well-written case discussion", excerpt: "A sample note on what a careful case write-up can teach that a slide cannot.", category: "professional-development", author: "Sample Editorial", date: "2026-10-07", featured: false, image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80", alt: "Person writing notes" },
  { slug: "ai-tools-beside-the-bedside", title: "AI tools beside the bedside: questions worth asking first", excerpt: "A sample introduction to checking what a digital suggestion can and cannot know.", category: "technology-ai", author: "Sample Contributor", date: "2026-11-11", featured: false, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80", alt: "Person working at a computer" },
  { slug: "sharing-knowledge-online", title: "Sharing clinical knowledge responsibly in a digital space", excerpt: "A sample commentary on audience, uncertainty and what should stay off a public post.", category: "technology-ai", author: "Sample Editorial", date: "2026-09-30", featured: false, image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80", alt: "Person using a laptop" },
].map((article) => ({
  ...article,
  content: article.slug === "safer-perioperative-handover" ? {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Why systems matter" }] },
      { type: "paragraph", content: [{ type: "text", text: "Clinical expertise is the foundation of good care, but expertise operates inside processes. How information is gathered, recorded and passed on influences what clinicians are able to see and do at the point of care." }] },
      { type: "paragraph", content: [{ type: "text", text: "Thinking in terms of systems shifts the question from who made the error to what in the process made the error easy to make, and hard to catch." }] },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Communication at the centre" }] },
      { type: "paragraph", content: [{ type: "text", text: "Handovers, briefings and checklists are tools for communication. Used well, they give every member of the team a shared picture and a clear opportunity to raise a concern." }] },
      { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Reliable care is rarely the result of one person’s vigilance alone. It is designed." }] }] },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Learning from everyday work" }] },
      { type: "paragraph", content: [{ type: "text", text: "Most of what teams learn can come from ordinary days, not only from incidents. Useful questions to ask include:" }] },
      { type: "bulletList", content: [
        "Where does information tend to get lost between steps?",
        "Which tasks depend on memory rather than on a reliable process?",
        "What would make it easier for a colleague to speak up?",
      ].map((text) => ({ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text }] }] })) },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Conclusion" }] },
      { type: "paragraph", content: [{ type: "text", text: "Strengthening the system around clinicians supports their vigilance rather than replacing it. Small, practical improvements to communication and process are a sensible place to begin. This is sample educational text, not clinical advice." }] },
    ],
  } : doc([
    article.excerpt,
    "This preview article is stored so the publications archive, category pages and article layout can be reviewed. Replace it with a reviewed manuscript before treating the page as a publication.",
    "The discussion here is intentionally general. It does not recommend a drug, a dose or a course of treatment.",
  ]),
}));
