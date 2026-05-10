import { useState, useEffect, useCallback } from 'react';
import quranData from './data/juz1.json';
import PartsList from './components/PartsList.jsx';
import ReadingView from './components/ReadingView.jsx';
import './App.css';

const AYAHS_PER_PART = 10;
const STORAGE_KEY = 'quran_juz1_progress';
const LAST_PART_KEY = 'quran_juz1_last_part';

function buildParts(data) {
  const parts = [];
  for (let i = 0; i < data.length; i += AYAHS_PER_PART) {
    const slice = data.slice(i, i + AYAHS_PER_PART);
    const surahNames = [...new Set(slice.map(a => a.se))];
    parts.push({
      id: parts.length + 1,
      ayahs: slice,
      surahNames,
      ayahRange: `${slice[0].n}-${slice[slice.length - 1].n}`,
    });
  }
  return parts;
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate it's an object
      if (parsed && typeof parsed === 'object') return parsed;
    }
    return {};
  } catch { return {}; }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    // Also save timestamp for debugging
    localStorage.setItem(STORAGE_KEY + '_updated', new Date().toISOString());
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

function saveLastPart(partId) {
  try { localStorage.setItem(LAST_PART_KEY, String(partId)); } catch {}
}

function loadLastPart() {
  try { return parseInt(localStorage.getItem(LAST_PART_KEY)) || null; } catch { return null; }
}

export default function App() {
  const [parts] = useState(() => buildParts(quranData));
  const [readParts, setReadParts] = useState(() => loadProgress());
  const [activePart, setActivePart] = useState(null);

  // Save to localStorage immediately whenever readParts changes
  useEffect(() => {
    saveProgress(readParts);
  }, [readParts]);

  // Also save on page unload (belt and suspenders)
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProgress(readParts);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveProgress(readParts);
      }
    });
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [readParts]);

  const toggleRead = useCallback((partId) => {
    setReadParts(prev => {
      const updated = { ...prev, [partId]: !prev[partId] };
      // Save IMMEDIATELY (don't wait for useEffect)
      saveProgress(updated);
      saveLastPart(partId);
      return updated;
    });
  }, []);

  const findNextUnread = useCallback(() => {
    // First try to resume from last read part
    const lastPartId = loadLastPart();
    if (lastPartId) {
      const nextAfterLast = parts.find(p => p.id > lastPartId && !readParts[p.id]);
      if (nextAfterLast) { setActivePart(nextAfterLast); return; }
    }
    // Otherwise find first unread
    const next = parts.find(p => !readParts[p.id]);
    if (next) setActivePart(next);
  }, [parts, readParts]);

  if (activePart) {
    return (
      <ReadingView
        part={activePart}
        isRead={!!readParts[activePart.id]}
        onToggleRead={() => toggleRead(activePart.id)}
        onBack={() => setActivePart(null)}
        onNext={() => {
          const nextPart = parts.find(p => p.id === activePart.id + 1);
          if (nextPart) setActivePart(nextPart);
          else setActivePart(null);
        }}
        hasNext={activePart.id < parts.length}
      />
    );
  }

  return (
    <PartsList
      parts={parts}
      readParts={readParts}
      onOpenPart={setActivePart}
      onContinue={findNextUnread}
    />
  );
}
