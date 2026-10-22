import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Users, MapPin, Search, X, Check, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Reservation } from '@shared/schema';

function StatusBadge({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d47d5b]/40 bg-[#d47d5b]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#d47d5b]">
        <X size={10} /> Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#527069]/40 bg-[#527069]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#527069]">
      <Check size={10} /> Confirmed
    </span>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function nightsBetween(checkIn: string, checkOut: string) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

const destinationImages: Record<string, string> = {
  'Casa Nera': 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=600&q=80',
  'Hoshinoya': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
  'The Bracken': 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80',
};

const destinationRegions: Record<string, string> = {
  'Casa Nera': 'Puglia, Italy',
  'Hoshinoya': 'Kyoto, Japan',
  'The Bracken': 'Cairngorms, Scotland',
};

export default function ReservationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null);

  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
    queryKey: ['api', 'reservations'],
    queryFn: async () => {
      console.log('[reservations] fetching');
      const res = await apiRequest('/api/reservations');
      return res.json();
    },
    meta: {
      onError: (err: unknown) => {
        toast({ title: 'Could not load reservations', description: String(err), variant: 'destructive' });
      },
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/reservations/${id}/cancel`, { method: 'PATCH' });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Reservation cancelled', description: 'The stay has been cancelled.' });
      queryClient.invalidateQueries({ queryKey: ['api', 'reservations'] });
      setConfirmCancel(null);
    },
    meta: {
      onError: (err: unknown) => {
        toast({ title: 'Could not cancel', description: String(err), variant: 'destructive' });
      },
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/reservations/${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Reservation removed', description: 'The record has been deleted.' });
      queryClient.invalidateQueries({ queryKey: ['api', 'reservations'] });
    },
    meta: {
      onError: (err: unknown) => {
        toast({ title: 'Could not delete', description: String(err), variant: 'destructive' });
      },
    },
  });

  const filtered = reservations.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.guestName.toLowerCase().includes(q) ||
      r.guestEmail.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const confirmed = reservations.filter((r) => r.status === 'confirmed').length;
  const cancelled = reservations.filter((r) => r.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-[#f5efe5] text-[#143e35]">
      {/* Header */}
      <header className="border-b border-[#d8cdbd] bg-[#f8f2e8] px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-[#527069] transition-colors hover:text-[#143e35]">
              <ArrowLeft size={16} strokeWidth={1.5} />
              <span className="eyebrow">Back to Lumina</span>
            </Link>
            <span className="h-5 w-px bg-[#d8cdbd]" />
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-[#d98463]">
                <span className="font-serif text-xl leading-none text-[#143e35]">L</span>
              </span>
              <div className="leading-none">
                <span className="block text-[15px] font-semibold tracking-[.22em]">LUMINA</span>
                <span className="mt-1 block font-mono text-[8px] uppercase tracking-[.18em] text-[#62736b]">Reservations</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-12 sm:px-10">
        {/* Page title */}
        <div className="mb-10">
          <div className="eyebrow mb-4 flex items-center gap-3 text-[#527069]">
            <span className="text-[#d47d5b]">01</span>
            <span className="h-px w-8 bg-[#527069]/40" />
            <span>Guest stays</span>
          </div>
          <h1 className="font-serif text-[clamp(3rem,6vw,5.5rem)] leading-[.88] tracking-[-0.025em]">
            Manage<br /><em>Reservations.</em>
          </h1>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4 sm:grid-cols-3">
          <div className="border border-[#d8cdbd] bg-[#f8f2e8] px-5 py-5">
            <span className="eyebrow block text-[#527069]">Total</span>
            <span className="mt-2 block font-serif text-4xl">{reservations.length}</span>
          </div>
          <div className="border border-[#d8cdbd] bg-[#f8f2e8] px-5 py-5">
            <span className="eyebrow block text-[#527069]">Confirmed</span>
            <span className="mt-2 block font-serif text-4xl text-[#143e35]">{confirmed}</span>
          </div>
          <div className="border border-[#d8cdbd] bg-[#f8f2e8] px-5 py-5">
            <span className="eyebrow block text-[#527069]">Cancelled</span>
            <span className="mt-2 block font-serif text-4xl text-[#d47d5b]">{cancelled}</span>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(['all', 'confirmed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`eyebrow border px-4 py-2 transition-colors ${
                  filter === f
                    ? 'border-[#143e35] bg-[#143e35] text-[#f8f2e8]'
                    : 'border-[#d8cdbd] bg-[#f8f2e8] text-[#527069] hover:border-[#143e35]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#527069]" />
            <input
              type="text"
              placeholder="Search guest, email, destination…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#d8cdbd] bg-[#f8f2e8] py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#143e35]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#527069] hover:text-[#143e35]">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Reservations list */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse border border-[#d8cdbd] bg-[#f8f2e8]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-[#d8cdbd] py-24 text-center">
            <AlertCircle size={32} strokeWidth={1} className="mb-4 text-[#b9b8a9]" />
            <p className="font-serif text-3xl text-[#143e35]">No reservations found.</p>
            <p className="mt-3 text-sm text-[#527069]">
              {search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Reservations made through the booking form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((r) => {
              const nights = nightsBetween(r.checkIn, r.checkOut);
              const img = destinationImages[r.destination];
              const region = destinationRegions[r.destination] ?? r.destination;
              return (
                <article
                  key={r.id}
                  className={`group flex flex-col overflow-hidden border bg-[#f8f2e8] transition-colors sm:flex-row ${
                    r.status === 'cancelled' ? 'border-[#d8cdbd] opacity-70' : 'border-[#d8cdbd] hover:border-[#143e35]'
                  }`}
                >
                  {/* Image */}
                  {img && (
                    <div className="h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-48">
                      <img
                        src={img}
                        alt={r.destination}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <StatusBadge status={r.status} />
                        <span className="eyebrow text-[#b9b8a9]">#{r.id}</span>
                      </div>
                      <h2 className="font-serif text-2xl leading-tight">{r.guestName}</h2>
                      <p className="mt-0.5 text-sm text-[#527069]">{r.guestEmail}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#527069]">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} strokeWidth={1.5} />
                          {r.destination}
                          <span className="text-[#b9b8a9]">· {region}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={13} strokeWidth={1.5} />
                          {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                          {nights > 0 && <span className="text-[#b9b8a9]">· {nights} night{nights !== 1 ? 's' : ''}</span>}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={13} strokeWidth={1.5} />
                          {r.guests} guest{r.guests !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      {r.status === 'confirmed' && (
                        <>
                          {confirmCancel === r.id ? (
                            <div className="flex items-center gap-2">
                              <span className="eyebrow text-[#d47d5b]">Confirm?</span>
                              <button
                                onClick={() => cancelMutation.mutate(r.id)}
                                disabled={cancelMutation.isPending}
                                className="eyebrow border border-[#d47d5b] px-3 py-2 text-[#d47d5b] transition-colors hover:bg-[#d47d5b] hover:text-[#f8f2e8]"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmCancel(null)}
                                className="eyebrow border border-[#d8cdbd] px-3 py-2 text-[#527069] transition-colors hover:border-[#143e35]"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmCancel(r.id)}
                              className="eyebrow border border-[#d8cdbd] px-4 py-2 text-[#527069] transition-colors hover:border-[#d47d5b] hover:text-[#d47d5b]"
                            >
                              Cancel stay
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(r.id)}
                        disabled={deleteMutation.isPending}
                        aria-label="Delete reservation"
                        className="flex h-9 w-9 items-center justify-center border border-[#d8cdbd] text-[#b9b8a9] transition-colors hover:border-[#d47d5b] hover:text-[#d47d5b]"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}