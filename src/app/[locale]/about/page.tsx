import { FileText, GraduationCap, MessageSquare, Search } from "lucide-react";
import { Source_Serif_4 } from "next/font/google";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getDoctor } from "@/lib/content/queries";

export const dynamic = "force-dynamic";

const serif = Source_Serif_4({ subsets: ["latin"], weight: ["600", "700"] });

const principles = [
  { n: "01", title: "Medical knowledge", text: "Clear, accurate explanations of concepts and practice.", icon: FileText },
  { n: "02", title: "Professional perspectives", text: "Thoughtful, practice-minded views from clinical experience.", icon: MessageSquare },
  { n: "03", title: "Evidence-informed thinking", text: "Writing that shows its reasoning and cites its sources.", icon: Search },
  { n: "04", title: "Continuous learning", text: "Insights shared to support learning across a career.", icon: GraduationCap },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const doctor = await getDoctor(locale as Locale);
  const profile = doctor?.translation;
  const name = profile?.name?.trim() || "";
  const title = profile?.title?.trim() || "";
  const biography = profile?.biography?.trim() || profile?.introduction?.trim() || "";
  const qualifications = Array.isArray(profile?.qualifications)
    ? profile.qualifications.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  return (
    <div className="text-[#26332F]">
      <div className="mx-auto max-w-[1120px] px-5 pt-8 sm:px-8">
        <nav aria-label="Breadcrumb" className="text-[14px] text-[#87918D]">
          <Link href="/" className="hover:text-[#0B6E66]">{t("nav.home")}</Link>
          <span className="px-2">/</span>
          <span className="text-[#64716D]">{t("nav.about")}</span>
        </nav>

        <section className="grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.14em] text-[#0B6E66] uppercase">About Pratap Insights</p>
            <h1 className={`${serif.className} mt-4 max-w-[14ch] text-[2.4rem] leading-[1.12] font-semibold tracking-[-0.02em] text-[#123A35] sm:text-[2.85rem]`}>
              A quiet, careful place for medical ideas.
            </h1>
            <p className="mt-6 max-w-[480px] text-[17px] leading-[1.65] text-[#64716D]">
              Pratap Insights exists to share medical knowledge and professional perspectives in a form that is clear, honest and useful.
            </p>
            <p className="mt-5 max-w-[480px] text-[17px] leading-[1.65] text-[#64716D]">
              We believe understanding grows through continuous learning and evidence-informed thinking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/publications" className="inline-flex items-center rounded-md bg-[#0B6E66] px-5 py-3 text-[15px] font-semibold text-white hover:bg-[#085E58]">
                Explore Publications →
              </Link>
              <Link href="/categories" className="inline-flex items-center rounded-md border border-[#E4E8E5] bg-white px-5 py-3 text-[15px] font-semibold text-[#123A35] hover:border-[#123A35]">
                Browse topics
              </Link>
            </div>
          </div>
          <HeroMark />
        </section>
      </div>

      <section className="border-t border-[#E4E8E5]">
        <div className="mx-auto grid max-w-[1120px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-20">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.14em] text-[#0B6E66] uppercase">Our purpose</p>
            <h2 className={`${serif.className} mt-4 max-w-[420px] text-[36px] leading-[1.15] font-semibold tracking-[-0.02em] text-[#123A35] sm:text-[42px]`}>
              A commitment to medical knowledge.
            </h2>
          </div>
          <div className="max-w-[520px] space-y-5 text-[16px] leading-[1.7] text-[#64716D] lg:pt-8">
            <p>Pratap Insights is a medical publishing platform for educational articles, professional perspectives and research-related insights. Its purpose is to share knowledge that supports understanding across healthcare.</p>
            <p>Every article aims to contribute something to medical understanding, whether it explains a concept, examines the evidence or invites reflection.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#E4E8E5]">
        <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8 lg:py-20">
          <p className="text-[12px] font-semibold tracking-[0.14em] text-[#0B6E66] uppercase">What we stand for</p>
          <h2 className={`${serif.className} mt-4 text-[36px] leading-tight font-semibold tracking-[-0.02em] text-[#123A35] sm:text-[42px]`}>Our editorial principles</h2>
          <ol className="mt-12 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {principles.map((item) => (
              <li key={item.n} className="flex flex-col">
                <p className="text-[12px] font-medium tracking-[0.08em] text-[#87918D]">{item.n}</p>
                <div className="mt-3 h-px w-16 bg-[#0B6E66]" />
                <article className="mt-6 flex flex-1 flex-col border border-[#E4E8E5] px-5 pt-6 pb-7">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#F2F5F2] text-[#0B6E66]">
                    <item.icon size={18} strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className={`${serif.className} mt-5 text-[22px] leading-snug font-semibold text-[#123A35]`}>{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.55] text-[#64716D]">{item.text}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[#E4E8E5]">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-[minmax(220px,320px)_1fr] md:gap-12 lg:py-20">
          {doctor?.portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doctor.portrait} alt={doctor.portraitAlt || name || "Author"} className="aspect-[7/8] w-full max-w-[320px] object-cover" />
          ) : (
            <AuthorMark initial={name ? name.trim().charAt(0).toUpperCase() : "PI"} named={Boolean(name)} />
          )}
          <div className="max-w-[560px]">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-[#0B6E66] uppercase">The author</p>
            <h2 className={`${serif.className} mt-3 text-[36px] font-semibold tracking-[-0.02em] text-[#123A35] sm:text-[42px]`}>{name || "Pratap Insights"}</h2>
            {title ? <p className="mt-2 text-[16px] text-[#64716D]">{title}</p> : null}
            {biography ? (
              <p className="mt-4 text-[16px] leading-[1.7] whitespace-pre-wrap text-[#64716D]">{biography}</p>
            ) : (
              <p className="mt-4 text-[16px] leading-[1.7] text-[#64716D]">A biography, role and affiliations will be published here only when those details have been verified.</p>
            )}
            {qualifications.length ? (
              <ul className="mt-4 space-y-1 text-[15px] text-[#64716D]">
                {qualifications.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
            {profile?.contactEmail ? (
              <a href={`mailto:${profile.contactEmail}`} className="mt-5 inline-block text-[15px] font-medium text-[#0B6E66] underline underline-offset-4">Contact the author</a>
            ) : (
              <Link href="/contact" className="mt-5 inline-block text-[15px] font-medium text-[#0B6E66] underline underline-offset-4">Contact the author</Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px] space-y-6 px-5 pb-16 sm:px-8">
        <aside className="border-l-[3px] border-[#0B6E66] bg-[#F2F5F2] px-6 py-5">
          <h2 className="text-[18px] font-semibold text-[#123A35]">Medical disclaimer</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#64716D]">
            Content published on Pratap Insights is intended for educational and informational purposes only and is not a substitute for professional medical advice, diagnosis or treatment.
          </p>
        </aside>
        <section className="flex flex-col gap-6 bg-[#0B6E66] px-7 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-9">
          <div>
            <h2 className={`${serif.className} text-[32px] font-semibold text-white sm:text-[36px]`}>Start reading</h2>
            <p className="mt-1 text-[15px] text-white/85">Explore the latest publications and perspectives.</p>
          </div>
          <Link href="/publications" className="inline-flex shrink-0 items-center rounded-md bg-white px-5 py-3 text-[15px] font-semibold text-[#0B6E66] hover:bg-[#F2F5F2]">
            Explore Publications →
          </Link>
        </section>
      </div>
    </div>
  );
}

function HeroMark() {
  return (
    <svg viewBox="0 0 640 440" className="h-auto w-full" role="img" aria-label="Open journal on a quiet clinical grid">
      <rect width="640" height="440" fill="#123A35" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={48 + i * 48} y1="0" x2={48 + i * 48} y2="440" stroke="#1A5C54" strokeWidth="1" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={28 + i * 48} x2="640" y2={28 + i * 48} stroke="#1A5C54" strokeWidth="1" />
      ))}
      <circle cx="452" cy="132" r="78" fill="none" stroke="#0B6E66" strokeWidth="1.25" opacity="0.9" />
      <rect x="78" y="86" width="210" height="248" fill="#0C2C28" stroke="#0B6E66" strokeWidth="1" opacity="0.95" />
      <line x1="102" y1="122" x2="262" y2="122" stroke="#E7EEF5" strokeWidth="1.4" opacity="0.85" />
      <line x1="102" y1="146" x2="246" y2="146" stroke="#E7EEF5" strokeWidth="1.2" opacity="0.55" />
      <line x1="102" y1="168" x2="236" y2="168" stroke="#E7EEF5" strokeWidth="1.2" opacity="0.55" />
      <line x1="102" y1="190" x2="252" y2="190" stroke="#E7EEF5" strokeWidth="1.2" opacity="0.4" />
      <line x1="102" y1="228" x2="250" y2="228" stroke="#0B6E66" strokeWidth="1" opacity="0.8" />
      <line x1="102" y1="252" x2="220" y2="252" stroke="#E7EEF5" strokeWidth="1.2" opacity="0.4" />
      <polyline points="72,348 210,348 246,348 278,292 312,392 344,318 376,348 568,348" fill="none" stroke="#F7F4EE" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function AuthorMark({ initial, named }: { initial: string; named: boolean }) {
  return (
    <div className="flex aspect-[7/8] w-full max-w-[320px] flex-col items-center justify-center bg-[#123A35] px-8 text-center" role="img" aria-label={named ? "Author portrait to follow" : "Author portrait has not been added"}>
      <span className="grid h-24 w-24 place-items-center rounded-full border border-[#0B6E66]/80 font-display text-[32px] font-semibold tracking-wide text-[#F2F5F2]">{initial}</span>
      <p className="mt-8 max-w-[180px] text-[12px] tracking-[0.12em] text-[#0B6E66] uppercase">{named ? "Portrait to follow" : "Portrait not yet added"}</p>
    </div>
  );
}
