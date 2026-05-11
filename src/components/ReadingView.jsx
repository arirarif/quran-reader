import { useRef, useEffect } from 'react';

export default function ReadingView({ part, isRead, onToggleRead, onBack, onNext, hasNext }) {
  const bodyRef = useRef(null);
  const autoCount = part.ayahs.filter(a => a.bntAuto).length;
  const allAuto = autoCount === part.ayahs.length;
  const hasAutoUcch = autoCount > 0;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [part.id]);

  return (
    <div className="reading-view">
      <div className="reading-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="info">
          <h2>PART {part.id}</h2>
          <span>{part.surahNames.join(' • ')} — Ayah {part.ayahRange}</span>
        </div>
        <span className="time-badge">~5 MIN</span>
      </div>

      <div className="reading-body" ref={bodyRef}>
        {hasAutoUcch && (
          <div className="auto-note">
            ℹ️ {allAuto ? 'এই অংশের' : 'এই অংশের কিছু আয়াতের'} উচ্চারণ
            স্বয়ংক্রিয়ভাবে আরবি থেকে তৈরি — তিলাওয়াতের সময় অভিজ্ঞ ক্বারীর
            সাহায্য নিন। অর্থ: মাওলানা মুহিউদ্দীন খান।
          </div>
        )}
        {part.ayahs.map(ayah => (
          <div key={ayah.g} className="dua-card">
            <div className="card-header">
              <div className="card-title">{ayah.se}</div>
              <div className="card-ref">{ayah.sno}:{ayah.n}</div>
            </div>
            <div className="card-body">
              <div className="arabic-block">{ayah.ar}</div>

              {ayah.bnt && (
                <>
                  <div className="uccharon-label">
                    উচ্চারণ
                    {ayah.bntAuto && <span className="auto-tag">auto</span>}
                  </div>
                  <div className="uccharon">{ayah.bnt}</div>
                </>
              )}

              <div className="ortho-label">অর্থ</div>
              <div className="ortho">{ayah.bn}</div>
            </div>
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
