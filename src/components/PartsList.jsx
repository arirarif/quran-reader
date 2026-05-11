export default function PartsList({ parts, readParts, onOpenPart, onContinue }) {
  const total = parts.length;
  const completed = Object.values(readParts).filter(Boolean).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasUnread = completed < total;

  return (
    <>
      <div className="header">
        <div className="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
        <h1>
          Quran Reader
          <span className="bn-title">পারা ১ — প্রতিদিন ৫ মিনিট</span>
        </h1>
        <p className="sub">আলিফ লাম মীম · সূরা ফাতিহা ও সূরা বাকারা ১–১৪১</p>
      </div>

      <div className="progress-box">
        <div className="progress-row">
          <span>অগ্রগতি · <strong>{completed}/{total}</strong> অংশ</span>
          <strong>{pct}%</strong>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {hasUnread && (
        <button className="continue-btn" onClick={onContinue}>
          ▶ পড়া চালিয়ে যান
        </button>
      )}

      {completed === total && total > 0 && (
        <div className="completion-banner">
          🎉 আলহামদুলিল্লাহ! পারা ১ সম্পূর্ণ!
        </div>
      )}

      <div className="parts-list">
        {parts.map(part => {
          const isRead = !!readParts[part.id];
          return (
            <div
              key={part.id}
              className={`dua-card part-card ${isRead ? 'read' : ''}`}
              onClick={() => onOpenPart(part)}
            >
              <div className="card-num">{isRead ? '✓' : part.id}</div>
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
