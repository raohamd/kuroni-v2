'use client';

import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface Rec {
  title: string;
  reason: string;
}

export default function AIGuruModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Rec[]>([]);

  if (!isOpen) return null;

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const res = await fetch('/api/ai-guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.recommendations) {
        setResults(data.recommendations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl bg-[#121218] border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4 text-purple-400">
          <Sparkles size={24} />
          <h2 className="text-xl font-bold text-white">Kuroni AI Guru</h2>
        </div>

        <form onSubmit={handleAskAI} className="mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Give me dark fantasy anime with intense action and no romance..."
            className="w-full bg-[#0B0B0E] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500 mb-3 h-24 resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Get Legal Recommendations'}
          </button>
        </form>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400">Top Picks For You:</h3>
            {results.map((rec, i) => (
              <div key={i} className="p-3 bg-[#1A1A24] border border-gray-800 rounded-xl">
                <h4 className="font-bold text-purple-400 text-base">{rec.title}</h4>
                <p className="text-xs text-gray-300 mt-1">{rec.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}