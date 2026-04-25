import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronRight, Map, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { ChapterSelector } from './components/ChapterSelector';
import { CluePanel } from './components/CluePanel';
import { ReadingView } from './components/ReadingView';
import { chapters, clues } from './data/chapters';
import { paragraphImages } from './data/images';
import { useProgress } from './hooks/useProgress';
import {
  playClickSound,
  playCloseSound,
  playClueSound,
  playHoverSound,
  playOpenSound,
  playPageTurnSound,
  setAmbientMode,
  stopAmbientAudio,
} from './lib/audio';

type Page = 'home' | 'chapters' | 'reading';

const STORAGE_AUDIO_KEY = 'newcomer-immersive-audio-enabled';

function getChapterMode(chapterId: string | null): 'quiet' | 'rain' | 'tension' | 'release' {
  if (!chapterId) return 'quiet';
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) return 'quiet';
  if (chapter.chapterNumber >= 8) return 'release';
  if (chapter.perspective === 'kaga') return 'rain';
  if (chapter.chapterNumber >= 5) return 'tension';
  return 'quiet';
}

function usePersistentAudioState() {
  const [enabled, setEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AUDIO_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AUDIO_KEY, String(enabled));
    } catch {
      // Ignore private mode storage failures.
    }
  }, [enabled]);

  return [enabled, setEnabled] as const;
}

function Home({
  onEnter,
  onResume,
  onReset,
  audioEnabled,
  onToggleAudio,
}: {
  onEnter: () => void;
  onResume: () => void;
  onReset: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}) {
  const firstImage = paragraphImages['p1-1'];

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      <img
        src={firstImage.url}
        alt={firstImage.alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,7,0.88),rgba(5,7,7,0.58)_48%,rgba(5,7,7,0.22)),linear-gradient(180deg,rgba(5,7,7,0.16),rgba(5,7,7,0.84))]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col justify-end px-4 pb-10 pt-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <div className="mono text-[11px] uppercase tracking-[0.34em] text-amber/80">Ningyocho Case Reader</div>
          <h1 className="serif mt-5 text-[clamp(4rem,14vw,10rem)] font-semibold leading-[0.92] tracking-normal">
            新参者
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/74 md:text-lg">
            把《新参者》重构成一条可进入的人形町证据链：九家店、九个视角、九张场景图，读者跟着加贺从街坊日常里拼出真相。
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onMouseEnter={() => audioEnabled && playHoverSound()}
              onClick={onEnter}
              className="inline-flex items-center gap-2 rounded-lg border border-amber/35 bg-amber/16 px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-amber transition hover:bg-amber/24"
            >
              <Map className="h-4 w-4" />
              进入人形町
            </button>
            <button
              type="button"
              onMouseEnter={() => audioEnabled && playHoverSound()}
              onClick={onResume}
              className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/[0.06] px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-white/78 transition hover:border-white/28"
            >
              <ChevronRight className="h-4 w-4" />
              继续阅读
            </button>
            <button
              type="button"
              onMouseEnter={() => audioEnabled && playHoverSound()}
              onClick={onToggleAudio}
              className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/[0.06] px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-white/70 transition hover:border-white/28"
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {audioEnabled ? 'Sound on' : 'Sound off'}
            </button>
            <button
              type="button"
              onMouseEnter={() => audioEnabled && playHoverSound()}
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-black/20 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-white/54 transition hover:border-crimson/40 hover:text-white/80"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </button>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {[
            ['章节', chapters.length],
            ['线索', clues.length],
            ['场景图', Object.keys(paragraphImages).length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/12 bg-black/28 p-4 backdrop-blur-md">
              <div className="mono text-[10px] uppercase tracking-[0.26em] text-white/42">{label}</div>
              <div className="serif mt-2 text-4xl font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function TopBar({
  page,
  onNavigate,
  audioEnabled,
  onToggleAudio,
  progressCount,
  clueCount,
  onOpenLedger,
}: {
  page: Page;
  onNavigate: (page: Page) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  progressCount: number;
  clueCount: number;
  onOpenLedger: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#070807]/88 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          onMouseEnter={() => audioEnabled && playHoverSound()}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber/25 bg-amber/12 text-lg font-semibold text-amber">
            新
          </div>
          <div>
            <div className="serif text-xl font-semibold leading-none">新参者</div>
            <div className="mt-1 mono text-[10px] uppercase tracking-[0.26em] text-white/36">Immersive Case Reader</div>
          </div>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`rounded-lg px-3 py-2 text-[10px] uppercase tracking-[0.24em] transition ${page === 'home' ? 'bg-white/[0.08] text-ink' : 'text-white/45 hover:text-ink'}`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('chapters')}
            className={`rounded-lg px-3 py-2 text-[10px] uppercase tracking-[0.24em] transition ${page === 'chapters' ? 'bg-white/[0.08] text-ink' : 'text-white/45 hover:text-ink'}`}
          >
            Chapters
          </button>
          <button
            type="button"
            onClick={onOpenLedger}
            className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-white/65 transition hover:border-amber/30 hover:text-ink"
          >
            Ledger
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 mono text-[10px] uppercase tracking-[0.2em] text-white/40 md:flex">
            {progressCount}/{chapters.length} read
          </div>
          <div className="hidden rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 mono text-[10px] uppercase tracking-[0.2em] text-white/40 md:flex">
            {clueCount}/{clues.length} clues
          </div>
          <button
            type="button"
            onClick={onToggleAudio}
            className="rounded-lg border border-white/12 bg-white/[0.04] p-3 text-white/65 transition hover:border-amber/30 hover:text-ink"
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = usePersistentAudioState();
  const { progress, collectClue, completeChapter, unlockChapter, setCurrentChapter, resetProgress } = useProgress();

  const currentChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === currentChapterId) ?? null,
    [currentChapterId],
  );

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (audioEnabled) playClickSound();
  }, [audioEnabled]);

  const selectChapter = useCallback((chapterId: string) => {
    setCurrentChapterId(chapterId);
    setCurrentChapter(chapterId);
    setCurrentPage('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (audioEnabled) playOpenSound();
  }, [audioEnabled, setCurrentChapter]);

  const resumeReading = useCallback(() => {
    const candidate = progress.currentChapter
      ?? progress.unlockedChapters.find((id) => !progress.completedChapters.includes(id))
      ?? progress.unlockedChapters[0]
      ?? chapters[0]?.id;
    if (candidate) selectChapter(candidate);
  }, [progress.completedChapters, progress.currentChapter, progress.unlockedChapters, selectChapter]);

  const openLedger = useCallback(() => {
    setIsLedgerOpen(true);
    if (audioEnabled) playOpenSound();
  }, [audioEnabled]);

  const closeLedger = useCallback(() => {
    setIsLedgerOpen(false);
    if (audioEnabled) playCloseSound();
  }, [audioEnabled]);

  const handleChapterComplete = useCallback(() => {
    if (!currentChapterId) return;
    completeChapter(currentChapterId);
    const chapter = chapters.find((item) => item.id === currentChapterId);
    if (chapter?.unlocksChapter) unlockChapter(chapter.unlocksChapter);
    if (audioEnabled) playClueSound();
  }, [audioEnabled, completeChapter, currentChapterId, unlockChapter]);

  const handleClueTrigger = useCallback((clueId: string) => {
    collectClue(clueId);
    if (audioEnabled) playClueSound();
  }, [audioEnabled, collectClue]);

  const handleReset = useCallback(() => {
    resetProgress();
    setCurrentChapterId(null);
    setCurrentPage('home');
    if (audioEnabled) playCloseSound();
  }, [audioEnabled, resetProgress]);

  useEffect(() => {
    const mode = currentPage === 'reading' ? getChapterMode(currentChapterId) : currentPage === 'chapters' ? 'release' : 'quiet';
    if (audioEnabled) setAmbientMode(mode, true);
    else stopAmbientAudio();
    return () => {};
  }, [audioEnabled, currentChapterId, currentPage]);

  useEffect(() => {
    return () => stopAmbientAudio();
  }, []);

  const nextChapterId = currentChapter?.unlocksChapter;

  return (
    <div className="min-h-screen">
      <TopBar
        page={currentPage}
        onNavigate={navigateTo}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled((value) => !value)}
        progressCount={progress.completedChapters.length}
        clueCount={progress.collectedClues.length}
        onOpenLedger={openLedger}
      />

      <AnimatePresence mode="wait">
        {currentPage === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Home
              onEnter={() => navigateTo('chapters')}
              onResume={resumeReading}
              onReset={handleReset}
              audioEnabled={audioEnabled}
              onToggleAudio={() => setAudioEnabled((value) => !value)}
            />
          </motion.div>
        )}

        {currentPage === 'chapters' && (
          <motion.div key="chapters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ChapterSelector
              chapters={chapters}
              unlockedChapters={progress.unlockedChapters}
              completedChapters={progress.completedChapters}
              collectedClues={progress.collectedClues}
              onSelectChapter={selectChapter}
              soundEnabled={audioEnabled}
            />
          </motion.div>
        )}

        {currentPage === 'reading' && currentChapter && (
          <motion.div key={currentChapter.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReadingView
              chapter={currentChapter}
              clues={clues}
              collectedClues={progress.collectedClues}
              onClueTrigger={handleClueTrigger}
              onParagraphAdvance={() => audioEnabled && playPageTurnSound()}
              onChapterComplete={handleChapterComplete}
              nextChapterId={nextChapterId}
              onNextChapter={selectChapter}
              onOpenLedger={openLedger}
              soundEnabled={audioEnabled}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <CluePanel
        clues={clues}
        chapters={chapters}
        collectedClueIds={progress.collectedClues}
        unlockedChapterIds={progress.unlockedChapters}
        isOpen={isLedgerOpen}
        onClose={closeLedger}
      />
    </div>
  );
}
