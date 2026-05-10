export default function PartsList({ parts, readParts, onOpenPart, onContinue }) {
  const total = parts.length;
  const completed = Object.values(readParts).filter(Boolean).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasUnread = completed < total;

  return (
    <>
      <div className="header">
        <div className="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
        <h1>📖 Quran — পারা ১</h1>
        <div className="sub">প্রতিদিন ৫ মিনিট পড়ুন</div>
      </div>

      <div className="progress-box">
        <div className="progress-row">
          <span>Progress: <strong>{completed}/{total}</strong> parts</span>
          <strong>{pct}%</strong>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {hasUnread && (
        <button className="continue-btn" onClick={onContinue}>
          ▶ Continue Reading
        </button>
      )}

      {completed === total && total > 0 && (
        <div style={{ textAlign: 'center', padding: '16px', color: '#16a34a', fontWeight: 700, fontSize: 18 }}>
          🎉 আলহামদুলিল্লাহ! পারা ১ সম্পূর্ণ!
        </div>
      )}

      <div className="parts-list">
        {parts.map(part => {
          const isRead = !!readParts[part.id];
          return (
            <div
              key={part.id}
              className={`part-card ${isRead ? 'read' : ''}`}
              onClick={() => onOpenPart(part)}
            >
              <div className="part-num">{isRead ? '✓' : part.id}</div>
              <div className="part-info">
                <div className="part-title">Part {part.id}</div>
                <div className="part-surah">
                  {part.surahNames.join(' • ')} — আয়াত {part.ayahRange}
                </div>
              </div>
              {isRead && <span className="part-badge">পড়া হয়েছে</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}
