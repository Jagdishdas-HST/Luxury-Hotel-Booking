import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDownRight, ArrowRight, CalendarDays, Check,
  ChevronDown, ChevronLeft, ChevronRight, Clock3,
  Menu, Minus, Plus, X,
} from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';
import { type ReactNode } from 'react';

/* ── image URLs ─────────────────────────────────────────────────────────── */
const IMG = {
  hero: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=90',
  casaNera: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1600&q=85',
  hoshinoya: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
  bracken: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85',
  lunch: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=85',
  dinner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85',
  room: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1500&q=90',
  deer: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=85',
  puglia: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=500&q=80',
  train: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=500&q=80',
};

/* ── data ────────────────────────────────────────────────────────────────── */
type Destination = { name: string; region: string; detail: string; image: string; note: string };

const destinations: Destination[] = [
  { name: 'Casa Nera', region: 'Puglia, Italy', detail: 'An olive grove, a limestone house, the Adriatic beyond.', image: IMG.casaNera, note: 'The southern light' },
  { name: 'Hoshinoya', region: 'Kyoto, Japan', detail: 'A quiet river bend beneath cedar and maple.', image: IMG.hoshinoya, note: 'The art of pause' },
  { name: 'The Bracken', region: 'Cairngorms, Scotland', detail: 'Wild country, peat fires and a table set for the weather.', image: IMG.bracken, note: 'North by nature' },
];

const rituals = [
  { time: '06:40', title: 'First light', body: 'A thermos of something warm waits outside your door. No knock, no hurry.', image: IMG.coffee },
  { time: '13:15', title: 'The long table', body: 'Lunch follows the market. Sit where the shade finds you; we will take care of the rest.', image: IMG.lunch },
  { time: '20:00', title: 'The quiet hour', body: 'Dinner is unhurried. The wine is local. The conversation is yours.', image: IMG.dinner },
];

/* ── tiny helpers ────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { node.classList.add('is-visible'); obs.unobserve(node); }
    }, { threshold: 0.12 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className ?? ''}`} />;
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-3">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${light ? 'border-[#e8b092]/70 text-[#e8b092]' : 'border-[#d47d5b] text-[#d47d5b]'}`}>
        <span className="block h-2 w-2 rounded-full bg-current" />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-semibold tracking-[.22em]">LUMINA</span>
        <span className={`mt-1 block font-mono text-[8px] uppercase tracking-[.18em] ${light ? 'text-[#d7cfc0]' : 'text-[#62736b]'}`}>Private hotels</span>
      </span>
    </a>
  );
}

function SectionLabel({ number, children, light = false }: { number: string; children: ReactNode; light?: boolean }) {
  return (
    <div className={`eyebrow flex items-center gap-3 ${light ? 'text-[#d6c6b3]' : 'text-[#527069]'}`}>
      <span className={light ? 'text-[#e8a384]' : 'text-[#d47d5b]'}>{number}</span>
      <span className={`h-px w-8 ${light ? 'bg-[#d6c6b3]/40' : 'bg-[#527069]/40'}`} />
      <span>{children}</span>
    </div>
  );
}

function ButtonArrow({ children, onClick, light = false, testId }: { children: ReactNode; onClick?: () => void; light?: boolean; testId: string }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`group inline-flex items-center gap-5 border-b pb-3 text-left text-[11px] font-semibold uppercase tracking-[.17em] transition-colors ${light ? 'border-[#e8b092]/60 text-[#f8f2e8] hover:border-[#f8f2e8]' : 'border-[#143e35]/40 text-[#143e35] hover:border-[#d47d5b]'}`}
    >
      {children}
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current transition-transform duration-300 group-hover:translate-x-1">
        <ArrowRight size={13} strokeWidth={1.5} />
      </span>
    </button>
  );
}

function ArrowUpRightIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#143e35]/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
      <ArrowDownRight size={15} className="-rotate-90" />
    </span>
  );
}

/* ── booking modal ───────────────────────────────────────────────────────── */
function BookingModal({ onClose, toast }: { onClose: () => void; toast: (m: string) => void }) {
  const [destination, setDestination] = useState('Casa Nera');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [submitted, setSubmitted] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!checkIn || !checkOut) { toast('Choose your dates and we will hold the quiet for you.'); return; }
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#143e35]/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Reserve your stay">
      <div className="booking-sheet relative w-full max-w-2xl border border-[#d8cdbd] bg-[#f8f2e8] p-6 text-[#143e35] shadow-2xl sm:p-10">
        <button onClick={onClose} aria-label="Close booking form" data-testid="button-close-booking" className="absolute right-5 top-5 p-2 text-[#527069] transition-colors hover:text-[#d47d5b]">
          <X size={18} strokeWidth={1.5} />
        </button>
        {!submitted ? (
          <>
            <SectionLabel number="01">A private invitation</SectionLabel>
            <h2 className="serif mt-5 max-w-lg text-5xl leading-[.95] sm:text-6xl">Where will you <em>disappear</em> to?</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#527069]">Tell us a little. We will take care of the particulars, personally.</p>
            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block">
                <span className="eyebrow mb-2 block text-[#527069]">Destination</span>
                <span className="relative block">
                  <select value={destination} onChange={(e) => setDestination(e.target.value)} data-testid="select-booking-destination" className="w-full appearance-none border-b border-[#b9b8a9] bg-transparent py-3 pr-8 text-[15px] outline-none focus:border-[#d47d5b]">
                    {destinations.map((p) => <option key={p.name}>{p.name}</option>)}
                    <option>Tell me where</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 top-3" size={16} strokeWidth={1.5} />
                </span>
              </label>
              <div className="grid grid-cols-2 gap-5">
                <label className="block">
                  <span className="eyebrow mb-2 block text-[#527069]">Arrive</span>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} data-testid="input-booking-arrival" className="w-full border-b border-[#b9b8a9] bg-transparent py-3 text-[15px] outline-none focus:border-[#d47d5b]" />
                </label>
                <label className="block">
                  <span className="eyebrow mb-2 block text-[#527069]">Depart</span>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} data-testid="input-booking-departure" className="w-full border-b border-[#b9b8a9] bg-transparent py-3 text-[15px] outline-none focus:border-[#d47d5b]" />
                </label>
              </div>
              <div className="flex items-end justify-between border-b border-[#b9b8a9] pb-3">
                <div>
                  <span className="eyebrow block text-[#527069]">Guests</span>
                  <span className="mt-2 block text-[15px]">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" disabled={guests === 1} onClick={() => setGuests((v) => Math.max(1, v - 1))} data-testid="button-decrease-guests" className="flex h-7 w-7 items-center justify-center border border-[#b9b8a9] disabled:opacity-30"><Minus size={13} /></button>
                  <button type="button" onClick={() => setGuests((v) => Math.min(8, v + 1))} data-testid="button-increase-guests" className="flex h-7 w-7 items-center justify-center border border-[#b9b8a9]"><Plus size={13} /></button>
                </div>
              </div>
              <button type="submit" data-testid="button-submit-booking" className="mt-2 flex w-full items-center justify-between bg-[#143e35] px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[.16em] text-[#f8f2e8] transition-colors hover:bg-[#d47d5b]">
                <span>Begin the conversation</span><ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex min-h-[390px] flex-col justify-between">
            <div>
              <SectionLabel number="02">Your stay, considered</SectionLabel>
              <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#d47d5b] text-[#f8f2e8]"><Check size={21} /></div>
              <h2 className="serif mt-7 text-6xl leading-[.9]">We have<br /><em>your note.</em></h2>
              <p className="mt-6 max-w-sm text-sm leading-6 text-[#527069]">A Lumina host will be in touch shortly to shape your stay at {destination}. No automated itineraries. Just a thoughtful reply.</p>
            </div>
            <button onClick={onClose} data-testid="button-finish-booking" className="mt-10 self-start border-b border-[#143e35]/40 pb-2 text-[11px] font-semibold uppercase tracking-[.16em]">Return to Lumina</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */
export default function Home() {
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [destIdx, setDestIdx] = useState(0);

  const introRef = useReveal();
  const destinationsRef = useReveal();
  const stayRef = useReveal();
  const ritualsRef = useReveal();
  const notesRef = useReveal();
  const invitationRef = useReveal();

  useEffect(() => {
    if (!toastMsg) return;
    const t = window.setTimeout(() => setToastMsg(''), 3600);
    return () => window.clearTimeout(t);
  }, [toastMsg]);

  const closeMenu = () => setMenuOpen(false);
  const showToast = (m: string) => setToastMsg(m);
  const dest = destinations[destIdx];

  return (
    <div id="top" className="noise min-h-[100dvh] overflow-hidden bg-[#f5efe5] text-[#143e35]">

      {/* ── announcement bar ── */}
      {announcementVisible && (
        <div className="relative z-40 flex items-center justify-center bg-[#143e35] px-10 py-2 text-[#f8f2e8]">
          <span className="text-[11px] font-semibold uppercase tracking-[.18em]">Now running on Joylo</span>
          <button
            onClick={() => setAnnouncementVisible(false)}
            aria-label="Dismiss announcement"
            className="absolute right-4 p-1 text-[#d6cfc3] transition-colors hover:text-[#e8b092]"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ── header ── */}
      <header className="absolute left-0 right-0 top-0 z-30 px-5 py-5 text-[#f8f2e8] sm:px-10 sm:py-7">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <Logo light />
          <nav className="hidden items-center gap-9 md:flex" aria-label="Main navigation">
            <a href="#destinations" data-testid="link-nav-destinations" className="eyebrow text-[#eee4d7] transition-colors hover:text-[#e8b092]">Places</a>
            <a href="#philosophy" data-testid="link-nav-philosophy" className="eyebrow text-[#eee4d7] transition-colors hover:text-[#e8b092]">Our way</a>
            <a href="#journal" data-testid="link-nav-journal" className="eyebrow text-[#eee4d7] transition-colors hover:text-[#e8b092]">Journal</a>
            <button onClick={() => setBookingOpen(true)} data-testid="button-nav-reserve" className="eyebrow border border-[#e8b092]/70 px-5 py-3 text-[#f8f2e8] transition-colors hover:bg-[#e8b092] hover:text-[#143e35]">Reserve</button>
          </nav>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu" data-testid="button-toggle-menu" className="p-2 md:hidden">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="absolute left-0 right-0 top-full border-t border-[#f8f2e8]/20 bg-[#143e35] px-6 py-6 md:hidden">
            <a onClick={closeMenu} href="#destinations" data-testid="link-mobile-destinations" className="eyebrow block border-b border-[#f8f2e8]/20 py-4 text-[#f8f2e8]">Places</a>
            <a onClick={closeMenu} href="#philosophy" data-testid="link-mobile-philosophy" className="eyebrow block border-b border-[#f8f2e8]/20 py-4 text-[#f8f2e8]">Our way</a>
            <a onClick={closeMenu} href="#journal" data-testid="link-mobile-journal" className="eyebrow block py-4 text-[#f8f2e8]">Journal</a>
            <button onClick={() => { closeMenu(); setBookingOpen(true); }} data-testid="button-mobile-reserve" className="mt-3 w-full bg-[#d47d5b] py-4 text-[11px] font-semibold uppercase tracking-[.16em] text-[#f8f2e8]">Reserve a stay</button>
          </nav>
        )}
      </header>

      <main>

        {/* ── hero ── */}
        <section className="relative flex min-h-[760px] items-end overflow-hidden bg-[#143e35] text-[#f8f2e8] sm:min-h-[850px]">
          <div className="absolute inset-0 overflow-hidden">
            <Img src={IMG.hero} alt="Sunlit mountain valley at dawn" className="hero-image scale-105 opacity-70" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#102f29] via-[#143e35]/15 to-[#143e35]/30" />
          <div className="absolute inset-0 bg-[#143e35]/10 mix-blend-multiply" />
          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-36 sm:px-10 sm:pb-40">
            <div className="max-w-4xl">
              <div className="eyebrow mb-6 flex items-center gap-3 text-[#e8b092]">
                <span className="h-px w-10 bg-[#e8b092]" /> The rare way to travel
              </div>
              <h1 className="serif leading-[.82] tracking-[-.03em]" style={{ fontSize: '70px' }}>Somewhere<br /><em style={{ fontSize: '28px', color: '#f5c4a1', textShadow: '0 1px 8px rgba(0,0,0,0.45)' }}>worth</em><br />arriving.</h1>
              <p className="mt-9 max-w-sm text-[15px] leading-7 text-[#d6cfc3]">A small collection of private hotels for people who travel to feel something. Not to fill the unhurried hours.</p>
              <div className="mt-10 flex flex-wrap gap-5">
                <button onClick={() => setBookingOpen(true)} data-testid="button-hero-reserve" className="inline-flex items-center gap-4 bg-[#d47d5b] px-4 py-2 text-[11px] font-semibold uppercase tracking-[.16em] text-[#f8f2e8] transition-colors hover:bg-[#e8b092] hover:text-[#143e35]">Reserve a stay <ArrowRight size={15} /></button>
                <a href="#destinations" className="inline-flex items-center gap-4 border border-[#f8f2e8]/40 px-7 py-4 text-[11px] font-semibold uppercase tracking-[.16em] text-[#f8f2e8] transition-colors hover:border-[#f8f2e8]">Explore places <ChevronDown size={15} /></a>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 right-8 hidden flex-col items-end gap-2 sm:flex">
            <span className="eyebrow text-[#d6cfc3]/60">Scroll</span>
            <span className="h-12 w-px bg-[#d6cfc3]/30" />
          </div>
        </section>

        {/* ── quick booking bar ── */}
        <section className="bg-[#f5efe5] px-5 py-24 sm:px-10 sm:py-36">
          <div className="mx-auto max-w-[1440px]">
            <div className="mx-auto grid max-w-[1120px] grid-cols-2 border border-[#d9cdbd] bg-[#f8f2e8] text-[#143e35] shadow-[0_18px_50px_rgba(20,62,53,.12)] sm:grid-cols-4">
              <button onClick={() => setBookingOpen(true)} data-testid="button-quick-destination" className="group border-b border-r border-[#d9cdbd] px-5 py-5 text-left transition-colors hover:bg-[#eee4d7] sm:border-b-0">
                <span className="eyebrow block text-[#527069]">Destination</span>
                <span className="mt-2 flex items-center justify-between text-[14px]">Choose a place <ChevronDown size={15} /></span>
              </button>
              <button onClick={() => setBookingOpen(true)} data-testid="button-quick-dates" className="group border-b border-[#d9cdbd] px-5 py-5 text-left transition-colors hover:bg-[#eee4d7] sm:border-b-0 sm:border-r">
                <span className="eyebrow block text-[#527069]">Dates</span>
                <span className="mt-2 flex items-center justify-between text-[14px]">When to wander <CalendarDays size={15} /></span>
              </button>
              <button onClick={() => setBookingOpen(true)} data-testid="button-quick-guests" className="group border-r border-[#d9cdbd] px-5 py-5 text-left transition-colors hover:bg-[#eee4d7]">
                <span className="eyebrow block text-[#527069]">Guests</span>
                <span className="mt-2 flex items-center justify-between text-[14px]">How many <Plus size={15} /></span>
              </button>
              <button onClick={() => setBookingOpen(true)} data-testid="button-quick-search" className="group bg-[#143e35] px-5 py-5 text-left text-[#f8f2e8] transition-colors hover:bg-[#d47d5b]">
                <span className="eyebrow block text-[#d6cfc3]">Search</span>
                <span className="mt-2 flex items-center justify-between text-[14px]">Find your stay <ArrowRight size={15} /></span>
              </button>
            </div>
          </div>
        </section>

        {/* ── philosophy ── */}
        <section id="philosophy" className="bg-[#f5efe5] px-5 pb-24 sm:px-10 sm:pb-36">
          <div ref={introRef} className="reveal mx-auto max-w-[1200px]">
            <h2 className="serif max-w-4xl text-[clamp(3.4rem,7vw,7.4rem)] leading-[.88] tracking-[-.025em]" style={{ color: '#ff0000', fontSize: '22px' }}>The luxury is not <em>more.</em><br />It is <em>enough.</em></h2>
            <div className="mt-12 grid max-w-2xl gap-8 text-[15px] leading-7 text-[#527069] sm:grid-cols-2">
              <p>Lumina began with a simple suspicion: that the best journeys leave room around them. Room for the afternoon to change its mind. For a second cup. For a road with no name.</p>
              <p>Our houses are small by design, deeply rooted in their places, and run by people who notice things. A cooler on the beach. The good table in town. When not to speak.</p>
            </div>
            <div className="mt-10">
              <ButtonArrow onClick={() => showToast('Our story is best told over a long lunch.')} testId="button-our-story">Read our story</ButtonArrow>
            </div>
          </div>
        </section>

        {/* ── destinations ── */}
        <section id="destinations" className="bg-[#dfe5d8] px-5 py-24 sm:px-10 sm:py-32">
          <div ref={destinationsRef} className="reveal mx-auto max-w-[1440px]">
            <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
              <div>
                <SectionLabel number="02">Four places, for now</SectionLabel>
                <h2 className="serif mt-6 text-6xl leading-[.9] sm:text-8xl">Follow<br /><em>the light.</em></h2>
              </div>
              <div className="flex max-w-xs items-end justify-between gap-8 text-sm leading-6 text-[#527069]">
                <p>From the first green hills of Puglia to a river bend in Kyoto. The coordinates matter less than the feeling.</p>
                <div className="hidden gap-2 sm:flex">
                  <button onClick={() => setDestIdx((v) => (v + destinations.length - 1) % destinations.length)} data-testid="button-previous-destination" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#527069]/50 transition-colors hover:bg-[#f5efe5]"><ChevronLeft size={16} /></button>
                  <button onClick={() => setDestIdx((v) => (v + 1) % destinations.length)} data-testid="button-next-destination" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#527069]/50 transition-colors hover:bg-[#f5efe5]"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
            <div className="mt-14 grid gap-4 lg:grid-cols-[1.18fr_.82fr]">
              <article className="group relative min-h-[530px] overflow-hidden bg-[#143e35] text-[#f8f2e8] lg:min-h-[650px]" data-testid={`card-destination-${dest.name.toLowerCase().replace(' ', '-')}`}>
                <Img src={dest.image} alt={dest.name + ' in ' + dest.region} className="transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#143e35]/90 via-transparent to-transparent" />
                <div className="absolute left-6 right-6 top-6 flex justify-between">
                  <span className="eyebrow text-[#e8b092]">01 / 03</span>
                  <span className="eyebrow text-[#f8f2e8]/70">{dest.note}</span>
                </div>
                <div className="absolute bottom-7 left-7 right-7">
                  <span className="eyebrow text-[#d6c6b3]">{dest.region}</span>
                  <h3 className="serif mt-2 text-6xl leading-none sm:text-7xl">{dest.name}</h3>
                  <p className="mt-4 max-w-xs text-sm leading-6 text-[#e6dfd4]">{dest.detail}</p>
                  <button onClick={() => setBookingOpen(true)} data-testid="button-destination-reserve" className="mt-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.16em] text-[#f8f2e8]">Explore this house <ArrowRight size={15} /></button>
                </div>
              </article>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                {destinations.filter((_, i) => i !== destIdx).map((place) => (
                  <button
                    key={place.name}
                    onClick={() => setDestIdx(destinations.findIndex((d) => d.name === place.name))}
                    data-testid={`button-destination-${place.name.toLowerCase().replace(' ', '-')}`}
                    className="group relative min-h-[260px] overflow-hidden text-left text-[#f8f2e8] lg:min-h-0 lg:flex-1"
                  >
                    <Img src={place.image} alt={place.name + ' destination'} className="transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-[#143e35]/25 transition-colors group-hover:bg-[#143e35]/10" />
                    <span className="absolute bottom-5 left-5">
                      <span className="eyebrow block text-[#e8b092]">{place.region}</span>
                      <span className="serif mt-1 block text-4xl">{place.name}</span>
                    </span>
                    <span className="absolute right-4 top-4 text-[#f8f2e8]/80"><ArrowDownRight size={18} /></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── room ── */}
        <section className="bg-[#143e35] px-5 py-24 text-[#f8f2e8] sm:px-10 sm:py-36">
          <div ref={stayRef} className="reveal mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
            <div className="order-2 lg:order-1">
              <SectionLabel number="03" light>The house, not the hotel</SectionLabel>
              <h2 className="serif mt-7 max-w-xl text-[clamp(3.8rem,7vw,7rem)] leading-[.84]">A room should<br />hold a <em>feeling.</em></h2>
              <p className="mt-9 max-w-md text-[15px] leading-7 text-[#d6cfc3]">Every Lumina room is a small world: linen that gets better with use, a window placed for the morning, a record selected for this particular weather. Nothing ornamental. Everything felt.</p>
              <ButtonArrow onClick={() => setBookingOpen(true)} light testId="button-view-rooms">Find your room</ButtonArrow>
            </div>
            <div className="relative order-1 aspect-[4/5] max-h-[680px] overflow-hidden sm:aspect-[5/6] lg:order-2">
              <Img src={IMG.room} alt="Quiet sunlit hotel room with linen bedding" />
              <div className="absolute bottom-5 left-5 border border-[#f8f2e8]/50 px-4 py-3">
                <span className="eyebrow text-[#e8b092]">Casa Nera · room 07</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── rituals ── */}
        <section className="bg-[#f5efe5] px-5 py-24 sm:px-10 sm:py-36">
          <div ref={ritualsRef} className="reveal mx-auto max-w-[1440px]">
            <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]">
              <div>
                <SectionLabel number="04">The Lumina rhythm</SectionLabel>
                <h2 className="serif mt-7 max-w-sm text-6xl leading-[.88] sm:text-7xl">Days worth<br /><em>remembering.</em></h2>
              </div>
              <p className="max-w-sm self-end text-sm leading-6 text-[#527069]">A stay here is not a list of amenities. It is a gentle sequence of moments, arranged loosely around you.</p>
            </div>
            <div className="mt-14 grid gap-px border-y border-[#c9c9b9] bg-[#c9c9b9] md:grid-cols-3">
              {rituals.map((ritual, i) => (
                <article key={ritual.title} className={`group relative min-h-[470px] overflow-hidden bg-[#f5efe5] p-6 ${i === 1 ? 'md:translate-y-10' : ''}`}>
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <Img src={ritual.image} alt={ritual.title} className="transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-[#143e35]/45" />
                  </div>
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex justify-between">
                      <span className="eyebrow text-[#d47d5b]">{ritual.time}</span>
                      <Clock3 size={17} strokeWidth={1.2} className="text-[#527069] transition-colors group-hover:text-[#f8f2e8]" />
                    </div>
                    <div>
                      <h3 className="serif text-5xl transition-colors group-hover:text-[#f8f2e8]">{ritual.title}</h3>
                      <p className="mt-4 max-w-xs text-sm leading-6 text-[#527069] transition-colors group-hover:text-[#eee4d7]">{ritual.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── journal ── */}
        <section id="journal" className="bg-[#e9d7cb] px-5 py-24 sm:px-10 sm:py-36">
          <div ref={notesRef} className="reveal mx-auto max-w-[1200px]">
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
              <div>
                <SectionLabel number="05">The house notes</SectionLabel>
                <h2 className="serif mt-7 text-6xl leading-[.88] sm:text-8xl">From our<br /><em>notebook.</em></h2>
              </div>
              <ButtonArrow onClick={() => showToast('The next note is still being written.')} testId="button-read-journal">Read all notes</ButtonArrow>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-[1.2fr_.8fr]">
              <article className="group cursor-pointer" onClick={() => showToast('Opening: A field guide to doing less.')} data-testid="card-journal-featured">
                <div className="aspect-[16/9] overflow-hidden">
                  <Img src={IMG.deer} alt="Wild deer in a quiet field" className="transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-5 flex justify-between gap-4">
                  <div>
                    <span className="eyebrow text-[#d47d5b]">Field notes · 06 min</span>
                    <h3 className="serif mt-3 text-4xl leading-none sm:text-5xl">A field guide to doing less.</h3>
                  </div>
                  <ArrowUpRightIcon />
                </div>
              </article>
              <div className="grid gap-8 md:pt-24">
                <article className="group cursor-pointer border-t border-[#c9ad9d] pt-5" onClick={() => showToast('Opening: The road beyond Ostuni.')} data-testid="card-journal-secondary">
                  <div className="flex gap-5">
                    <div className="h-24 w-24 shrink-0 overflow-hidden">
                      <Img src={IMG.puglia} alt="Puglian coast" className="transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div>
                      <span className="eyebrow text-[#d47d5b]">Puglia · 04 min</span>
                      <h3 className="serif mt-2 text-3xl leading-none">The road beyond Ostuni.</h3>
                    </div>
                  </div>
                </article>
                <article className="group cursor-pointer border-t border-[#c9ad9d] pt-5" onClick={() => showToast('Opening: Notes on an early train.')} data-testid="card-journal-tertiary">
                  <div className="flex gap-5">
                    <div className="h-24 w-24 shrink-0 overflow-hidden">
                      <Img src={IMG.train} alt="Quiet train in Japan" className="transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div>
                      <span className="eyebrow text-[#d47d5b]">Kyoto · 03 min</span>
                      <h3 className="serif mt-2 text-3xl leading-none">Notes on an early train.</h3>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ── final CTA ── */}
        <section className="relative overflow-hidden bg-[#d47d5b] px-5 py-24 text-[#143e35] sm:px-10 sm:py-32">
          <div ref={invitationRef} className="reveal relative z-10 mx-auto max-w-[1200px]">
            <SectionLabel number="06">Your invitation</SectionLabel>
            <div className="mt-8 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <h2 className="serif max-w-4xl text-[clamp(4rem,9vw,9rem)] leading-[.78] tracking-[-.04em]">Leave room<br /><em>for wonder.</em></h2>
              <div className="max-w-xs">
                <p className="text-sm leading-6">Tell us where you would like to go. We will make the rest feel easy.</p>
                <button onClick={() => setBookingOpen(true)} data-testid="button-final-reserve" className="mt-7 inline-flex items-center gap-4 border-b border-[#143e35]/50 pb-3 text-[11px] font-semibold uppercase tracking-[.17em] transition-colors hover:border-[#143e35]">
                  Reserve your stay
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current"><ArrowRight size={13} /></span>
                </button>
              </div>
            </div>
          </div>
          <div className="marquee-track absolute bottom-0 left-0 flex w-max translate-y-1/2 gap-10 whitespace-nowrap font-mono text-[11px] uppercase tracking-[.2em] text-[#143e35]/25">
            <span>Lumina Hotels · Places with room to breathe · Lumina Hotels · Places with room to breathe · </span>
            <span>Lumina Hotels · Places with room to breathe · Lumina Hotels · Places with room to breathe · </span>
          </div>
        </section>

      </main>

      <SiteFooter />

      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} toast={showToast} />}
      {toastMsg && (
        <div className="fade-in fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 border border-[#d8cdbd] bg-[#f8f2e8] px-5 py-4 text-sm text-[#143e35] shadow-xl" role="status" data-testid="status-toast">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d47d5b] text-[#f8f2e8]"><Check size={12} /></span>
          {toastMsg}
        </div>
      )}
    </div>
  );
}