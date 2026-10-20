import SiteFooter from '@/components/SiteFooter';

export default function About() {
  return (
    <div className="min-h-[100dvh] bg-[#f5efe5] text-[#143e35]">
      <main className="mx-auto max-w-[1200px] px-5 py-32 sm:px-10">
        <div className="eyebrow mb-6 flex items-center gap-3 text-[#527069]">
          <span className="text-[#d47d5b]">01</span>
          <span className="h-px w-8 bg-[#527069]/40" />
          <span>Our story</span>
        </div>
        <h1 className="serif text-[clamp(4rem,9vw,9rem)] leading-[.82] tracking-[-.03em]">
          About<br /><em>Lumina</em>
        </h1>
        <div className="mt-12 grid max-w-2xl gap-8 text-[15px] leading-7 text-[#527069] sm:grid-cols-2">
          <p>Lumina was founded on a single belief: that the most meaningful travel leaves room around it. Room for the afternoon to change its mind. For a second cup. For a road with no name.</p>
          <p>We are a small collection of private hotels, each deeply rooted in its place and run by people who notice things. We do not scale. We do not franchise. We simply find extraordinary houses and take very good care of them.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}