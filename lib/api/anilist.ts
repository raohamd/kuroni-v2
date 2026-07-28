export async function getTrendingAnime() {
  const query = `
    query {
      Page(page: 1, perPage: 15) {
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title {
            english
            romaji
          }
          coverImage {
            extraLarge
          }
          bannerImage
          averageScore
          episodes
          description
          trailer {
            id
            site
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 }
    });
    const data = await res.json();
    return data.data?.Page?.media || [];
  } catch (error) {
    console.error('AniList Fetch Error:', error);
    return [];
  }
}

// Replace ONLY the getAnimeDetails function inside lib/api/anilist.ts

export async function getAnimeDetails(id: string) {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        idMal
        title {
          english
          romaji
        }
        coverImage {
          extraLarge
        }
        bannerImage
        description
        episodes
        averageScore
        genres
        status
        trailer {
          id
          site
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { id: parseInt(id, 10) } }),
      cache: 'no-store' // <--- This completely clears the stuck cache!
    });
    
    const data = await res.json();
    return data.data?.Media || null;
    
  } catch (error) {
    console.error('AniList Details Error:', error);
    return null;
  }
}