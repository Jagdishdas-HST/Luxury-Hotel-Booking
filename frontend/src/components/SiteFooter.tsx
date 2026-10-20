import { Globe2 } from 'lucide-react';
import { useState } from 'react';

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-3">
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

export default function SiteFooter() {
  const [toastMsg, setToastMsg] = useState('');

  function showToast(m: string) {
    setToastMsg(m);
    window.setTimeout(() => setToastMsg(''), 3600);
  }

  return (
    <>
      <footer className="bg-[#143e35] px-5 pb-8 pt-16 text-[#f8f2e8] sm:px-10 sm:pt-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-12 border-b border-[#f8f2e8]/20 pb-16 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div>
              <Logo light />
              <p className="mt-8 max-w-xs text-sm leading-6 text-[#d6cfc3]">Private hotels for people who would rather be somewhere else.</p>
            </div>
            <div>
              <span className="eyebrow text-[#e8b092]">Explore</span>
              <div className="mt-5 grid gap-3 text-sm text-[#d6cfc3]">
                <a href="/#destinations" data-testid="link-footer-places" className="w-fit transition-colors hover:text-[#e8b092]">Our places</a>
                <a href="/#philosophy" data-testid="link-footer-way" className="w-fit transition-colors hover:text-[#e8b092]">The Lumina way</a>
                <a href="/#journal" data-testid="link-footer-journal" className="w-fit transition-colors hover:text-[#e8b092]">Journal</a>
              </div>
            </div>
            <div>
              <span className="eyebrow text-[#e8b092]">Say hello</span>
              <div className="mt-5 grid gap-3 text-sm text-[#d6cfc3]">
                <button onClick={() => showToast('A host will be with you shortly.')} data-testid="button-footer-contact" className="w-fit text-left transition-colors hover:text-[#e8b092]">Write to a host</button>
                <button onClick={() => showToast('Call us at +39 0831 781 204.')} data-testid="button-footer-call" className="w-fit text-left transition-colors hover:text-[#e8b092]">+39 0831 781 204</button>
                <span>hello@luminahotels.com</span>
              </div>
            </div>
            <div>
              <span className="eyebrow text-[#e8b092]">Follow along</span>
              <div className="mt-5 grid gap-3 text-sm text-[#d6cfc3]">
                <button onClick={() => showToast('Instagram opens in a new window.')} data-testid="button-footer-instagram" className="w-fit text-left transition-colors hover:text-[#e8b092]">Instagram</button>
                <button onClick={() => showToast('Our newsletter is on its way.')} data-testid="button-footer-newsletter" className="w-fit text-left transition-colors hover:text-[#e8b092]">The Lumina letter</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 pt-7 text-[10px] uppercase tracking-[.14em] text-[#a7b1a8] sm:flex-row">
            <span>© 2024 Lumina Hotels</span>
            <div className="flex gap-6">
              <button onClick={() => showToast('Privacy, with care.')} data-testid="button-footer-privacy">Privacy</button>
              <button onClick={() => showToast('Terms, plainly written.')} data-testid="button-footer-terms">Terms</button>
              <span className="inline-flex items-center gap-2"><Globe2 size={12} /> EN / EUR</span>
            </div>
          </div>
        </div>
      </footer>
      {toastMsg && (
        <div className="fade-in fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 border border-[#d8cdbd] bg-[#f8f2e8] px-5 py-4 text-sm text-[#143e35] shadow-xl" role="status">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d47d5b] text-[#f8f2e8]">✓</span>
          {toastMsg}
        </div>
      )}
    </>
  );
}