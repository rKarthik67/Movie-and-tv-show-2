const WATCHLIST_KEYS = { movie: 'ark-play:movie-watchlist', tv: 'ark-play:tv-watchlist' };
const SHARED_SECRET_KEY = 'ark-play:shared-watchlist-secret.v1';
const PENDING_CHANGES_KEY = 'ark-play:shared-watchlist-pending-changes.v1';
// Keep this aligned with ARKTheater's sharedWatchlistBaseUrl. The raw Oracle
// IP no longer serves the watchlist API; this HTTPS endpoint is where the
// shared library assigns the authoritative addedAt timestamp.
const sharedBaseUrl = (process.env.REACT_APP_SHARED_WATCHLIST_BASE_URL || 'https://arkscraper.duckdns.org').replace(/\/+$/, '');

const getStorageKey = (type) => WATCHLIST_KEYS[type];
const itemKey = (item) => `${item.type}:${item.id}`;
const timestampKeys = ['addedAt', 'dateAdded', 'createdAt', 'added_at', 'created_at', 'timestamp', 'savedAt'];
const timestampToIso = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Support both Unix seconds and JavaScript milliseconds.
    const date = new Date(value < 100000000000 ? value * 1000 : value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
const normalizedItem = (item) => {
  if (!item || typeof item !== 'object') return item;
  const timestamp = timestampKeys.map((key) => timestampToIso(item[key])).find(Boolean);
  return timestamp ? { ...item, addedAt: timestamp } : item;
};
const addedAtValue = (item) => {
  const timestamp = Date.parse(normalizedItem(item)?.addedAt || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
};
const newestFirst = (items) => items
  .map((item, index) => ({ item, index }))
  .sort((a, b) => addedAtValue(b.item) - addedAtValue(a.item) || a.index - b.index)
  .map(({ item }) => item);

export const getWatchlist = (type) => {
  const key = getStorageKey(type);
  if (!key || typeof window === 'undefined') return [];
  try {
    const items = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(items) ? newestFirst(items.map(normalizedItem)) : [];
  } catch (error) {
    console.error('Unable to read watchlist:', error);
    return [];
  }
};

const saveWatchlist = (type, items, { notify = true } = {}) => {
  const key = getStorageKey(type);
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items.map(normalizedItem)));
    if (notify) window.dispatchEvent(new Event('ark-play-watchlist-updated'));
  } catch (error) {
    console.error('Unable to save watchlist:', error);
  }
};

const localItems = () => [
  ...getWatchlist('movie').map((item) => ({ ...item, type: 'movie' })),
  ...getWatchlist('tv').map((item) => ({ ...item, type: 'tv' })),
];

const saveSnapshot = (snapshot) => {
  const deleted = new Set((snapshot.deleted || []).map(itemKey));
  const local = localItems().map(normalizedItem);
  const localByKey = new Map(local.map((item) => [itemKey(item), item]));
  const received = (snapshot.items || []).map(normalizedItem);
  const receivedKeys = new Set(received.map(itemKey));

  // The API is the common source of truth. Retain its sequence when dates
  // tie (for example, when a whole local list was joined at once), which is
  // the same ordering ARKTheater gets from its snapshot. Keep only genuinely
  // local, not-yet-uploaded titles after the server's items.
  const serverItems = received
    .filter((item) => !deleted.has(itemKey(item)))
    .map((incoming) => {
      const existing = localByKey.get(itemKey(incoming));
      return incoming?.addedAt || !existing?.addedAt
        ? incoming
        : { ...incoming, addedAt: existing.addedAt };
    });
  const pendingLocalItems = local.filter((item) =>
    !deleted.has(itemKey(item)) && !receivedKeys.has(itemKey(item)));
  const items = newestFirst([...serverItems, ...pendingLocalItems]);
  saveWatchlist('movie', items.filter((item) => item.type === 'movie'), { notify: false });
  saveWatchlist('tv', items.filter((item) => item.type === 'tv'), { notify: false });
  window.dispatchEvent(new Event('ark-play-watchlist-updated'));
};

const readPendingChanges = () => {
  try {
    const changes = JSON.parse(window.localStorage.getItem(PENDING_CHANGES_KEY) || '[]');
    return Array.isArray(changes) ? changes : [];
  } catch (_) { return []; }
};

const queueChange = (operation, item) => {
  if (!isSharedWatchlist()) return;
  const byKey = new Map(readPendingChanges().map((change) => [itemKey(change.item), change]));
  byKey.set(itemKey(item), { operation, item: { ...item } });
  window.localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify([...byKey.values()]));
};

const removePendingChange = (change) => {
  const rest = readPendingChanges().filter((current) => itemKey(current.item) !== itemKey(change.item));
  if (rest.length) window.localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(rest));
  else window.localStorage.removeItem(PENDING_CHANGES_KEY);
};

const request = async (path, { method = 'GET', body, secret = getSharedWatchlistSecret() } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (secret) headers.Authorization = `Bearer ${secret}`;
  const response = await fetch(`${sharedBaseUrl}/api/v2/watchlist${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try { data = await response.json(); } catch (_) { data = null; }
  if (!response.ok || data?.success !== true) {
    throw new Error(data?.error || `Shared watchlist request failed (${response.status}).`);
  }
  return data;
};

export const getSharedWatchlistSecret = () =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(SHARED_SECRET_KEY);
export const isSharedWatchlist = () => Boolean(getSharedWatchlistSecret());

export const createSharedWatchlist = async () => {
  const data = await request('/libraries', { method: 'POST', body: { items: localItems() }, secret: null });
  window.localStorage.setItem(SHARED_SECRET_KEY, data.librarySecret);
  saveSnapshot(data);
  return data;
};

export const joinSharedWatchlist = async (code) => {
  const data = await request('/pairings/join', { method: 'POST', body: { code, items: localItems() }, secret: null });
  window.localStorage.setItem(SHARED_SECRET_KEY, data.librarySecret);
  saveSnapshot(data);
  return data;
};

export const createSharedPairingCode = () => request('/pairings', { method: 'POST' });
export const disconnectSharedWatchlist = () => {
  window.localStorage.removeItem(SHARED_SECRET_KEY);
  window.localStorage.removeItem(PENDING_CHANGES_KEY);
  window.dispatchEvent(new Event('ark-play-watchlist-updated'));
};

export const syncSharedWatchlist = async () => {
  if (!isSharedWatchlist()) return null;
  for (const change of readPendingChanges()) {
    const isRemoval = change.operation === 'remove';
    const data = await request(isRemoval ? `/items/${change.item.type}/${change.item.id}` : '/items', {
      method: isRemoval ? 'DELETE' : 'POST',
      body: isRemoval ? undefined : { item: change.item },
    });
    removePendingChange(change);
    saveSnapshot(data);
  }
  const data = await request('/sync', { method: 'POST', body: { items: localItems() } });
  saveSnapshot(data);
  return data;
};

export const startSharedWatchlistPolling = () => {
  if (typeof window === 'undefined') return () => {};
  const poll = () => syncSharedWatchlist().catch(() => {});
  poll();
  const interval = window.setInterval(poll, 15000);
  return () => window.clearInterval(interval);
};

export const isInWatchlist = (type, id) =>
  getWatchlist(type).some((item) => String(item.id) === String(id));

export const toggleWatchlistItem = (type, item) => {
  const items = getWatchlist(type);
  const existing = items.find((savedItem) => String(savedItem.id) === String(item.id));
  if (existing) {
    saveWatchlist(type, items.filter((savedItem) => String(savedItem.id) !== String(item.id)));
    queueChange('remove', { ...existing, type });
    syncSharedWatchlist().catch(() => {});
    return false;
  }
  const addedItem = { ...item, type, addedAt: new Date().toISOString() };
  saveWatchlist(type, newestFirst([addedItem, ...items]));
  queueChange('add', addedItem);
  syncSharedWatchlist().catch(() => {});
  return true;
};

export const removeWatchlistItem = (type, id) => {
  const items = getWatchlist(type);
  const item = items.find((savedItem) => String(savedItem.id) === String(id));
  saveWatchlist(type, items.filter((savedItem) => String(savedItem.id) !== String(id)));
  if (item) {
    queueChange('remove', { ...item, type });
    syncSharedWatchlist().catch(() => {});
  }
};

export const clearWatchlist = () => {
  const items = localItems();
  saveWatchlist('movie', [], { notify: false });
  saveWatchlist('tv', [], { notify: false });
  items.forEach((item) => queueChange('remove', item));
  window.dispatchEvent(new Event('ark-play-watchlist-updated'));
  syncSharedWatchlist().catch(() => {});
};
