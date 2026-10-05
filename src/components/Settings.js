import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animationChoices, fontChoices, useThemeSettings } from '../themeSettings';
import {
  clearWatchlist as clearStoredWatchlist,
  createSharedPairingCode,
  createSharedWatchlist,
  disconnectSharedWatchlist,
  getWatchlist,
  isSharedWatchlist,
  joinSharedWatchlist,
  syncSharedWatchlist,
} from '../watchlistStorage';
import './Settings.css';

const categories = [
  ['header', 'Headers', 'Section titles and hero headings'],
  ['card', 'Poster & card titles', 'Titles below posters and in grids'],
  ['body', 'Descriptions & body text', 'Synopses and long-form copy'],
  ['info', 'Info & metadata', 'Years, genres, ratings, and helper text'],
  ['cast', 'Cast & crew', 'Names in cast sections'],
  ['button', 'Buttons & actions', 'Primary, outlined, and text buttons'],
  ['navigation', 'Navigation labels', 'Top and mobile dock labels'],
];

const regions = [['IN', 'India'], ['US', 'United States'], ['GB', 'United Kingdom'], ['CA', 'Canada'], ['AU', 'Australia']];
const themeColors = [['#E0A83A', 'Gold'], ['#E5484D', 'Rose'], ['#8E5CF7', 'Violet'], ['#1686F2', 'Blue'], ['#16A56A', 'Emerald'], ['#F06D2F', 'Orange']];

const Settings = () => {
  const { settings, update, updateCategoryFont, updateCategoryColor, reset } = useThemeSettings();
  const importInput = useRef(null);
  const [shared, setShared] = useState(() => isSharedWatchlist());

  const exportWatchlist = () => {
    const contents = JSON.stringify({
      app: 'ARKPlay',
      export: 'watchlist',
      version: 1,
      exportedAt: new Date().toISOString(),
      items: [
        ...getWatchlist('movie').map((item) => ({ ...item, type: 'movie' })),
        ...getWatchlist('tv').map((item) => ({ ...item, type: 'tv' })),
      ],
    }, null, 2);
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'arkplay-watchlist.json'; link.click(); URL.revokeObjectURL(url);
  };
  const importWatchlist = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const saved = JSON.parse(reader.result);
        let movieItems;
        let tvItems;

        // Legacy ARK Play backups have separate arrays. ARKTheater exports a
        // versioned `items` array, with each title carrying its own type.
        if (Array.isArray(saved.movie) && Array.isArray(saved.tv)) {
          movieItems = saved.movie;
          tvItems = saved.tv;
        } else if (Array.isArray(saved.items)) {
          movieItems = saved.items.filter((item) => item?.type === 'movie');
          tvItems = saved.items.filter((item) => item?.type === 'tv');
        } else {
          throw new Error('Invalid watchlist file');
        }

        const validItems = (items) => items.filter((item) => item && item.id != null && typeof item.title === 'string');
        movieItems = validItems(movieItems);
        tvItems = validItems(tvItems);
        localStorage.setItem('ark-play:movie-watchlist', JSON.stringify(movieItems));
        localStorage.setItem('ark-play:tv-watchlist', JSON.stringify(tvItems));
        window.dispatchEvent(new Event('ark-play-watchlist-updated'));
        window.alert(`Imported ${movieItems.length} movie${movieItems.length === 1 ? '' : 's'} and ${tvItems.length} TV show${tvItems.length === 1 ? '' : 's'}.`);
      } catch (_) { window.alert('That file is not a valid ARK Play or ARKTheater watchlist.'); }
    };
    reader.readAsText(file); event.target.value = '';
  };
  const clearWatchlist = () => {
    if (!window.confirm('Clear every bookmarked movie and TV show?')) return;
    clearStoredWatchlist();
  };
  const withSharedError = async (action) => {
    try { await action(); } catch (error) { window.alert(error.message || 'Shared watchlist request failed.'); }
  };
  const createShared = () => withSharedError(async () => {
    await createSharedWatchlist(); setShared(true);
    window.alert('Shared watchlist created. Use “Add device” to create a code.');
  });
  const joinShared = () => withSharedError(async () => {
    const code = window.prompt('Enter the four-digit code from a linked device:');
    if (!code) return;
    await joinSharedWatchlist(code.trim()); setShared(true);
    window.alert('This browser is now connected to the shared watchlist.');
  });
  const syncShared = () => withSharedError(async () => {
    await syncSharedWatchlist(); window.alert('Shared watchlist synced.');
  });
  const addDevice = () => withSharedError(async () => {
    const pairing = await createSharedPairingCode();
    window.alert(`Enter this code on the other device within four minutes:\n\n${pairing.code}`);
  });
  const disconnectShared = () => {
    if (!window.confirm('Disconnect this browser? Local titles stay here and other linked devices remain connected.')) return;
    disconnectSharedWatchlist(); setShared(false);
  };
  const clearImageCache = async () => {
    if ('caches' in window) await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
    window.alert('Browser image cache cleared where supported.');
  };

  return (
    <section className="appearance-page motion-enter">
      <div className="appearance-hero"><p className="eyebrow">ARK PLAY</p><h1>Settings</h1><p>Library, appearance, motion, catalog, and browser storage controls.</p></div>

      <SettingsGroup title="Library">
        <div className="settings-actions"><Link className="appearance-reset" to="/watchlist">My Watchlist</Link><button type="button" onClick={exportWatchlist}>Export watchlist</button><button type="button" onClick={() => importInput.current?.click()}>Import watchlist</button><input ref={importInput} hidden type="file" accept="application/json" onChange={importWatchlist} /></div>
        <div className="settings-actions shared-watchlist-actions">
          {shared ? <><button type="button" onClick={syncShared}>Sync now</button><button type="button" onClick={addDevice}>Add device</button><button className="appearance-reset" type="button" onClick={disconnectShared}>Disconnect shared watchlist</button></> : <><button type="button" onClick={createShared}>Create shared watchlist</button><button type="button" onClick={joinShared}>Join with code</button></>}
        </div>
      </SettingsGroup>
      <SettingsGroup title="Appearance">
        <div className="appearance-grid">
          <RangeCard label="Liquid glass blur" value={settings.glassOpacity} min="0" max="4" step=".1" text={settings.glassOpacity.toFixed(1)} onChange={(glassOpacity) => update({ glassOpacity: Number(glassOpacity) })} />
          <RangeCard label="Text size" value={settings.textScale} min=".85" max="1.4" step=".05" text={`${Math.round(settings.textScale * 100)}%`} onChange={(textScale) => update({ textScale: Number(textScale) })} />
          <ChoiceCard label="Body & UI font" value={settings.bodyFont} onChange={(bodyFont) => update({ bodyFont })} help="Navigation, metadata, buttons, and general copy." />
          <ChoiceCard label="Display font" value={settings.displayFont} onChange={(displayFont) => update({ displayFont })} help="Hero titles and section headings." />
          <label className="appearance-card theme-color-card"><span>App theme color</span><div className="theme-swatches" role="group" aria-label="Theme color presets">{themeColors.map(([color, name]) => <button type="button" key={color} className="theme-swatch" style={{ '--swatch-color': color }} aria-label={`${name} theme`} aria-pressed={settings.accent.toLowerCase() === color.toLowerCase()} onClick={() => update({ accent: color, animationColor: color })} />)}</div><input type="color" value={settings.accent} onChange={(event) => update({ accent: event.target.value })} /><small>Changes the app’s accent, background tint, surfaces, borders, and highlights.</small></label>
        </div>
      </SettingsGroup>
      <SettingsGroup title="Motion">
        <div className="appearance-grid">
          <ChoiceCard label="Entrance animation" value={settings.animation} choices={animationChoices} onChange={(animation) => update({ animation })} disabled={settings.reduceMotion} help="Posters, cards, and text sections." />
          <label className="appearance-card"><span>Animation sweep color</span><input type="color" value={settings.animationColor} onChange={(event) => update({ animationColor: event.target.value })} /><small>Accent tint used by animated elements.</small></label>
          <label className="appearance-card appearance-toggle"><span>Reduce motion</span><input type="checkbox" checked={settings.reduceMotion} onChange={(event) => update({ reduceMotion: event.target.checked })} /><small>Turns off animations and hover movement.</small></label>
        </div>
      </SettingsGroup>
      <SettingsGroup title="Fonts & Colors">
        <p className="settings-intro">Pick a family and color for each text role, independently.</p>
        <div className="appearance-grid category-grid">{categories.map(([key, label, help]) => <label className="appearance-card" key={key}><span>{label}</span><select value={settings.categoryFonts[key]} onChange={(event) => updateCategoryFont(key, event.target.value)}>{fontChoices.map(([value, name]) => <option value={value} key={value}>{name}</option>)}</select><input type="color" value={settings.categoryColors[key] || '#f5f5f7'} onChange={(event) => updateCategoryColor(key, event.target.value)} /><small>{help}</small></label>)}</div>
      </SettingsGroup>
      <SettingsGroup title="Catalog"><label className="appearance-card"><span>Watch region</span><select value={settings.watchRegion} onChange={(event) => update({ watchRegion: event.target.value })}>{regions.map(([code, name]) => <option value={code} key={code}>{name} ({code})</option>)}</select><small>Used by the Platforms catalog.</small></label></SettingsGroup>
      <SettingsGroup title="Data & Storage"><div className="settings-actions"><button type="button" onClick={clearWatchlist}>Clear watchlist</button><button type="button" onClick={clearImageCache}>Clear image cache</button><button className="appearance-reset" type="button" onClick={reset}>Reset appearance</button></div></SettingsGroup>
      <SettingsGroup title="About"><p className="settings-intro">ARK Play · Version 1.0.0</p><p className="settings-intro">Title data, artwork, and cast information are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p></SettingsGroup>
    </section>
  );
};

const SettingsGroup = ({ title, children }) => <section className="settings-group"><h2>{title}</h2>{children}</section>;
const RangeCard = ({ label, value, min, max, step, text, onChange }) => <label className="appearance-card"><span>{label}</span><input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} /><small>{text}</small></label>;
const ChoiceCard = ({ label, value, choices = fontChoices, onChange, help, disabled = false }) => <label className="appearance-card"><span>{label}</span><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{choices.map(([item, name]) => <option value={item} key={item}>{name}</option>)}</select><small>{help}</small></label>;

export default Settings;
