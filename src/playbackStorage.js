const PLAYBACK_KEY = 'ark-play:playback-progress:v1';

const readAll = () => {
  try {
    const value = JSON.parse(localStorage.getItem(PLAYBACK_KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
};

const keyFor = ({ type, id, season, episode }) => [type, id, season || '', episode || ''].join(':');

export const getPlaybackProgress = (identity) => readAll()[keyFor(identity)] || null;

export const savePlaybackProgress = (identity, progress) => {
  const all = readAll();
  all[keyFor(identity)] = {
    ...progress,
    updatedAt: Date.now(),
  };
  localStorage.setItem(PLAYBACK_KEY, JSON.stringify(all));
};

export const clearPlaybackProgress = (identity) => {
  const all = readAll();
  delete all[keyFor(identity)];
  localStorage.setItem(PLAYBACK_KEY, JSON.stringify(all));
};
