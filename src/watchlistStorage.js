const WATCHLIST_KEYS = {
  movie: 'ark-play:movie-watchlist',
  tv: 'ark-play:tv-watchlist',
};

const getStorageKey = (type) => WATCHLIST_KEYS[type];

export const getWatchlist = (type) => {
  const key = getStorageKey(type);

  if (!key || typeof window === 'undefined') return [];

  try {
    const savedItems = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(savedItems) ? savedItems : [];
  } catch (error) {
    console.error('Unable to read watchlist:', error);
    return [];
  }
};

const saveWatchlist = (type, items) => {
  const key = getStorageKey(type);
  if (!key || typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event('ark-play-watchlist-updated'));
  } catch (error) {
    console.error('Unable to save watchlist:', error);
  }
};

export const isInWatchlist = (type, id) =>
  getWatchlist(type).some((item) => String(item.id) === String(id));

export const toggleWatchlistItem = (type, item) => {
  const items = getWatchlist(type);
  const itemExists = items.some((savedItem) => String(savedItem.id) === String(item.id));

  if (itemExists) {
    saveWatchlist(type, items.filter((savedItem) => String(savedItem.id) !== String(item.id)));
    return false;
  }

  saveWatchlist(type, [item, ...items]);
  return true;
};

export const removeWatchlistItem = (type, id) => {
  saveWatchlist(
    type,
    getWatchlist(type).filter((item) => String(item.id) !== String(id))
  );
};
