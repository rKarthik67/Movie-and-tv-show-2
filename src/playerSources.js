export const PLAYER_SOURCES = [
  { id: 'vidsync', label: 'VidSync', movie: (id) => `https://vidsync.pro/embed/movie/${id}`, tv: (id, s, e) => `https://vidsync.pro/embed/tv/${id}/${s}/${e}` },
  { id: 'moviesnexus', label: 'MoviesNexus', movie: (id) => `https://www.moviesnexus.fun/movie/${id}?sv=multiaudio2`, tv: (id, s, e) => `https://www.moviesnexus.fun/tv/${id}/${s}/${e}?sv=multiaudio2` },
  { id: 'server1', label: 'Server 1', movie: (id) => `https://vidsrcme.ru/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { id: 'server2', label: 'Server 2', movie: (id) => `https://pro.vidsrc.sbs/embed/movie/${id}`, tv: (id, s, e) => `https://pro.vidsrc.sbs/embed/tv/${id}/${s}/${e}` },
  { id: 'vidcore', label: 'VidCore', movie: (id) => `https://vidcore.org/embed/movie/${id}`, tv: (id, s, e) => `https://vidcore.org/embed/tv/${id}/${s}/${e}` },
  { id: 'vidlink', label: 'VidLink', movie: (id) => `https://vidlink.pro/movie/${id}`, tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}` },
  { id: 'vidrift', label: 'VidRift', movie: (id) => `https://embed.vidrift.net/embed/movie/${id}`, tv: (id, s, e) => `https://embed.vidrift.net/embed/tv/${id}/${s}/${e}` },
  { id: 'server5', label: 'Server 5', movie: (id) => `https://player.smashy.stream/movie/${id}`, tv: (id, s, e) => `https://player.smashy.stream/tv/${id}?s=${s}&e=${e}` },
  { id: 'server6', label: 'Server 6', movie: (id) => `https://iembed.codeera.dev/embed/movie/${id}`, tv: (id, s, e) => `https://iembed.codeera.dev/embed/tv/${id}/${s}/${e}` },
  { id: 'server7', label: 'Server 7', movie: (id) => `https://player.videasy.net/movie/${id}`, tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}` },
];

export const sourceUrl = (sourceId, type, id, season, episode) => {
  const source = PLAYER_SOURCES.find((item) => item.id === sourceId) || PLAYER_SOURCES[0];
  return type === 'tv' ? source.tv(id, season, episode) : source.movie(id);
};
