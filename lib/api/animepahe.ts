// lib/api/animepahe.ts

const API_BASE_URL = 'https://vercel.app'; // Replace with your backend URL

export async function searchAnimepahe(query: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to fetch anime data');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
