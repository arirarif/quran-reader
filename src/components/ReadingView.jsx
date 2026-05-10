import { useRef, useEffect } from 'react';

export default function ReadingView({ part, isRead, onToggleRead, onBack, onNext, hasNext }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [part.id]);

  return (
    <div className="reading-view">
      <div className="reading-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="info">
          <h2>Part {part.id}</h2>
          <span>{part.surahNames.join(' • ')} — Ayah {part.ayahRange}</span>
        </div>
        <span className="time-badge">~5 min</span>
      </div>

      <div className="reading-body" ref={bodyRef}>
        {part.ayahs.map(ayah => (
          <div key={ayah.g} className="ayah-card">
            <span className="ayah-badge">
              {ayah.se} {ayah.sno}:{ayah.n}
            </span>
            <div className="arabic-text">{ayah.ar}</div>
            <div className="lang-label">বাংলা</div>
            <div className="bangla-text">{ayah.bn}</div>
            <div className="lang-label" style={{ marginTop: 12 }}>English</div>
            <div className="english-text">{ayah.en}</div>
          </div>
        ))}
      </div>

      <div className="reading-footer">
        <button
          className={`mark-read-btn ${isRead ? 'done' : 'active'}`}
          onClick={onToggleRead}
        >
          {isRead ? '✓ পড়া হয়েছে' : '✓ পড়া শেষ'}
        </button>
        {hasNext && (
          <button className="next-btn" onClick={onNext}>
            পরের →
          </button>
        )}
      </div>
    </div>
  );
}
