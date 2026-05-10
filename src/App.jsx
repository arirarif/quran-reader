import { useState, useEffect } from 'react';
import quranData from './data/juz1.json';
import PartsList from './components/PartsList.jsx';
import ReadingView from './components/ReadingView.jsx';
import './App.css';

const AYAHS_PER_PART = 10;
const STORAGE_KEY = 'quran_juz1_progress';

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
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveProgress(progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
}

export default function App() {
  const [parts] = useState(() => buildParts(quranData));
  const [readParts, setReadParts] = useState(loadProgress);
  const [activePart, setActivePart] = useState(null);

  useEffect(() => {
    saveProgress(readParts);
  }, [readParts]);

  const toggleRead = (partId) => {
    setReadParts(prev => ({ ...prev, [partId]: !prev[partId] }));
  };

  const findNextUnread = () => {
    const next = parts.find(p => !readParts[p.id]);
    if (next) setActivePart(next);
  };

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
