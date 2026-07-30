// app/page.tsx
import Link from "next/link";
import { Play, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-[#1A1A24] to-[#0F0F14] border border-gray-800 p-10 mb-10">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles size={14} />
          Kuroni
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          Watch anime, ad-free.
        </h1>
        <p className="text-gray-400 max-w-xl mb-6">
          Stream your favorite series with multiple servers, backup mirrors,
          and an AI guide to help you pick what's next.
        </p>
        <Link
          href="/watch/frieren?ep=1"
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition"
        >
          <Play size={16} />
          Start watching Frieren
        </Link>
      </section>

      {/* Placeholder featured section */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Featured</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <FeaturedCard
            title="Frieren: Beyond Journey's End"
            href="/watch/frieren?ep=1"
          />
        </div>
        <p className="text-xs text-gray-600 mt-4">
          More titles coming soon — hook this section up to your AniList
          integration to populate it dynamically.
        </p>
      </section>
    </div>
  );
}

function FeaturedCard({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-lg overflow-hidden border border-gray-800 bg-[#1A1A24] hover:border-purple-500 transition"
    >
      <div className="aspect-[2/3] bg-[#141419] flex items-center justify-center text-gray-700 text-xs">
        No image
      </div>
      <div className="p-2">
        <p className="text-xs font-semibold text-gray-300 group-hover:text-white truncate">
          {title}
        </p>
      </div>
    </Link>
  );
}