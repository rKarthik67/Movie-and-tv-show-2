import React, { useEffect, useMemo, useState } from 'react';
import './LiveTv.css';

const apiBase = (process.env.REACT_APP_SHARED_WATCHLIST_BASE_URL || 'https://arkscraper.duckdns.org').replace(/\/+$/, '');

const LiveTv = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/api/v2/live-tv/channels`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || body.success !== true) throw new Error(body.error || 'Could not load channels.');
        setChannels(body.channels || []);
      })
      .catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message || 'Could not load channels.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const languages = useMemo(() => [...new Set(channels.map((item) => item.language).filter(Boolean))].sort(), [channels]);
  const categories = useMemo(() => [...new Set(channels.map((item) => item.category).filter(Boolean))].sort(), [channels]);
  const shown = channels.filter((item) =>
    (!search || `${item.name} ${item.country}`.toLowerCase().includes(search.toLowerCase())) &&
    (!language || item.language === language) && (!category || item.category === category));

  return <section className="live-tv">
    <div className="live-tv-intro"><div><p className="eyebrow">LIVE TV</p><h2>Free channels from around the world</h2><p>Free-to-view sources curated by Free TV. Availability can vary by country.</p></div><span>{shown.length} channels</span></div>
    <div className="live-tv-filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search channels or countries" /><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="">All languages</option>{languages.map((value) => <option key={value}>{value}</option>)}</select><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></div>
    {selected && <div className="live-tv-player"><div><strong>{selected.name}</strong><span>{selected.country} · {selected.language} · {selected.category}</span></div><button type="button" onClick={() => setSelected(null)}>Close</button><video controls autoPlay playsInline src={selected.url}>Your browser cannot play this channel.</video><small>Some HLS channels only play in Safari; broadcaster geo-restrictions may apply.</small></div>}
    {loading && <p className="live-tv-status">Loading worldwide channels…</p>}
    {error && <p className="live-tv-status">{error}</p>}
    {!loading && !error && <div className="live-tv-grid">{shown.map((channel) => <button className="live-tv-card" type="button" key={channel.id} onClick={() => setSelected(channel)}>{channel.logo ? <img src={channel.logo} alt="" /> : <div className="live-tv-logo">TV</div>}<strong>{channel.name}</strong><span>{channel.country} · {channel.language}</span><small>{channel.category}</small></button>)}</div>}
  </section>;
};

export default LiveTv;
