import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronRight, Image as ImageIcon, Search, X } from 'lucide-react';
import type { Chapter, Clue, Paragraph } from '../types/story';
import { paragraphImages, type StoryImage } from '../data/images';
import { playHoverSound } from '../lib/audio';

interface ReadingViewProps {
  chapter: Chapter;
  clues: Clue[];
  collectedClues: string[];
  onClueTrigger: (clueId: string) => void;
  onParagraphAdvance: () => void;
  onChapterComplete: () => void;
  nextChapterId?: string;
  onNextChapter?: (chapterId: string) => void;
  onOpenLedger: () => void;
  soundEnabled: boolean;
}

const chapterOrdinals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

function getParagraphImage(paragraph: Paragraph): StoryImage | null {
  return paragraphImages[paragraph.id] ?? null;
}

function getPerspectiveLabel(perspective: Chapter['perspective']) {
  return perspective === 'kaga' ? '加贺视角' : '街区证词';
}

export function ReadingView({
  chapter,
  clues,
  collectedClues,
  onClueTrigger,
  onParagraphAdvance,
  onChapterComplete,
  nextChapterId,
  onNextChapter,
  onOpenLedger,
  soundEnabled,
}: ReadingViewProps) {
  const [visibleCount, setVisibleCount] = useState(2);
  const [activeClue, setActiveClue] = useState<Clue | null>(null);
  const [lightbox, setLightbox] = useState<StoryImage | null>(null);
  const activeParagraphRef = useRef<HTMLElement | null>(null);
  const hasCompleted = useRef(false);
  const clueTimerRef = useRef<number | null>(null);

  const chapterClues = useMemo(
    () => clues.filter((clue) => clue.chapterId === chapter.id),
    [chapter.id, clues],
  );

  const collectedChapterClues = chapterClues.filter((clue) => collectedClues.includes(clue.id));
  const progressPercent = Math.round((visibleCount / chapter.paragraphs.length) * 100);

  const triggerClue = useCallback((clueId: string) => {
    const clue = clues.find((item) => item.id === clueId);
    if (!clue || collectedClues.includes(clue.id)) return;
    onClueTrigger(clue.id);
    setActiveClue(clue);
    if (clueTimerRef.current) window.clearTimeout(clueTimerRef.current);
    clueTimerRef.current = window.setTimeout(() => setActiveClue(null), 3600);
  }, [clues, collectedClues, onClueTrigger]);

  const revealNext = useCallback(() => {
    if (visibleCount >= chapter.paragraphs.length) return;
    onParagraphAdvance();
    const nextIndex = visibleCount;
    setVisibleCount(nextIndex + 1);

    const nextParagraph = chapter.paragraphs[nextIndex];
    if (nextParagraph?.clueTrigger) {
      window.setTimeout(() => triggerClue(nextParagraph.clueTrigger!), 420);
    }

    if (nextIndex + 1 >= chapter.paragraphs.length && !hasCompleted.current) {
      hasCompleted.current = true;
      window.setTimeout(() => onChapterComplete(), 700);
    }
  }, [chapter.paragraphs, onChapterComplete, onParagraphAdvance, triggerClue, visibleCount]);

  useEffect(() => {
    setVisibleCount(2);
    setActiveClue(null);
    hasCompleted.current = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapter.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        revealNext();
      }
      if (event.key === 'l' || event.key === 'L') onOpenLedger();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenLedger, revealNext]);

  useEffect(() => {
    activeParagraphRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [visibleCount]);

  const visibleParagraphs = chapter.paragraphs.slice(0, visibleCount);
  const chapterImage = getParagraphImage(chapter.paragraphs.find((p) => paragraphImages[p.id]) ?? chapter.paragraphs[0]);
  const showEndCredits = chapter.chapterNumber === 9 && visibleCount >= chapter.paragraphs.length;

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0">
          <header className="relative mb-6 min-h-[360px] overflow-hidden rounded-lg border border-white/10">
            {chapterImage && (
              <img src={chapterImage.url} alt={chapterImage.alt} className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,7,0.24),rgba(6,7,7,0.88)),linear-gradient(90deg,rgba(6,7,7,0.88),rgba(6,7,7,0.2))]" />
            <div className="relative z-10 flex min-h-[360px] flex-col justify-end p-6 md:p-8">
              <div className="mono text-[10px] uppercase tracking-[0.28em] text-amber/75">
                Chapter {chapterOrdinals[chapter.chapterNumber - 1]} / {getPerspectiveLabel(chapter.perspective)}
              </div>
              <h1 className="serif mt-3 text-[clamp(3rem,8vw,6.6rem)] font-semibold leading-none tracking-normal">
                {chapter.title}
              </h1>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-lg border border-white/12 bg-black/25 px-3 py-1.5 mono text-[10px] uppercase tracking-[0.2em] text-white/56">
                  {visibleCount}/{chapter.paragraphs.length} paragraphs
                </span>
                <span className="rounded-lg border border-white/12 bg-black/25 px-3 py-1.5 mono text-[10px] uppercase tracking-[0.2em] text-white/56">
                  {collectedChapterClues.length}/{chapterClues.length} clues
                </span>
              </div>
            </div>
          </header>

          <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber via-frost to-crimson transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <section className="space-y-5">
            {visibleParagraphs.map((paragraph, index) => {
              const image = getParagraphImage(paragraph);
              const isHot = index === visibleParagraphs.length - 1;

              return (
                <motion.article
                  ref={isHot ? activeParagraphRef : undefined}
                  key={paragraph.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5 md:p-6"
                >
                  {image && (
                    <button
                      type="button"
                      onMouseEnter={() => soundEnabled && playHoverSound()}
                      onClick={() => setLightbox(image)}
                      className="mb-5 block w-full overflow-hidden rounded-lg border border-white/10 bg-black/20 text-left"
                    >
                      <img src={image.url} alt={image.alt} className="h-auto w-full object-cover transition duration-700 hover:scale-[1.02]" />
                      {image.caption && (
                        <div className="flex items-center gap-2 px-4 py-3 text-xs leading-6 text-white/58">
                          <ImageIcon className="h-4 w-4 text-amber/75" />
                          {image.caption}
                        </div>
                      )}
                    </button>
                  )}
                  <div className="flex gap-4">
                    <div className="mono pt-1 text-xs text-amber/62">{String(index + 1).padStart(2, '0')}</div>
                    <p className="serif text-xl leading-10 text-ink md:text-2xl">{paragraph.content}</p>
                  </div>
                </motion.article>
              );
            })}
          </section>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {visibleCount < chapter.paragraphs.length ? (
              <button
                type="button"
                onMouseEnter={() => soundEnabled && playHoverSound()}
                onClick={revealNext}
                className="inline-flex items-center gap-2 rounded-lg border border-amber/35 bg-amber/12 px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-amber transition hover:bg-amber/20"
              >
                <ChevronRight className="h-4 w-4" />
                继续推进
              </button>
            ) : nextChapterId && onNextChapter ? (
              <button
                type="button"
                onMouseEnter={() => soundEnabled && playHoverSound()}
                onClick={() => onNextChapter(nextChapterId)}
                className="inline-flex items-center gap-2 rounded-lg border border-amber/35 bg-amber/12 px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-amber transition hover:bg-amber/20"
              >
                <ChevronRight className="h-4 w-4" />
                下一章
              </button>
            ) : (
              <button
                type="button"
                onMouseEnter={() => soundEnabled && playHoverSound()}
                onClick={onOpenLedger}
                className="inline-flex items-center gap-2 rounded-lg border border-amber/35 bg-amber/12 px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-amber transition hover:bg-amber/20"
              >
                <BookOpen className="h-4 w-4" />
                查看完整案卷
              </button>
            )}
            <button
              type="button"
              onMouseEnter={() => soundEnabled && playHoverSound()}
              onClick={onOpenLedger}
              className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-white/65 transition hover:border-white/24"
            >
              <BookOpen className="h-4 w-4" />
              案卷
            </button>
          </div>

          <AnimatePresence>
            {showEndCredits && (
              <motion.section
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative mt-8 min-h-[520px] overflow-hidden rounded-lg border border-white/12"
              >
                <img
                  src="/images/18_nihonbashi_credits.png"
                  alt="雨后的日本桥谢幕场景"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,6,0.18),rgba(5,6,6,0.92)),linear-gradient(90deg,rgba(5,6,6,0.88),rgba(5,6,6,0.28))]" />
                <div className="relative z-10 flex min-h-[520px] flex-col justify-end p-6 md:p-8">
                  <div className="mono text-[10px] uppercase tracking-[0.34em] text-amber/75">End credits</div>
                  <h2 className="serif mt-4 max-w-4xl text-[clamp(2.8rem,7vw,6rem)] font-semibold leading-none tracking-normal">
                    人形町的灯，一家一家暗下去。
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                    真相被说出口后，街道没有变成舞台。仙贝店继续开门，料亭继续备菜，钟表继续走。加贺穿过日本桥，像电影谢幕后的最后一个背影，把案子交还给活着的人。
                  </p>
                  <div className="mt-8 grid gap-3 md:grid-cols-3">
                    {['九家店', '二十七条线索', '一个新参者'].map((item) => (
                      <div key={item} className="rounded-lg border border-white/12 bg-black/28 px-4 py-3 backdrop-blur-md">
                        <div className="serif text-2xl font-semibold">{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        <aside className="h-fit rounded-lg border border-white/10 bg-white/[0.04] p-5 xl:sticky xl:top-24">
          <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.24em] text-white/38">
            <Search className="h-4 w-4 text-amber/75" />
            Chapter clues
          </div>
          <div className="mt-4 space-y-3">
            {chapterClues.map((clue) => {
              const collected = collectedClues.includes(clue.id);
              return (
                <div key={clue.id} className={`rounded-lg border p-4 ${collected ? 'border-amber/24 bg-amber/8' : 'border-white/10 bg-black/12 opacity-55'}`}>
                  <div className="text-sm font-medium text-ink">{collected ? clue.title : '未发现线索'}</div>
                  <p className="mt-2 text-xs leading-6 text-white/54">{collected ? clue.description : `继续阅读到第 ${clue.triggerParagraph} 段。`}</p>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {activeClue && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-5 left-1/2 z-[80] w-[min(92vw,560px)] -translate-x-1/2 rounded-lg border border-amber/30 bg-[#10110f]/96 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="mono text-[10px] uppercase tracking-[0.24em] text-amber/75">Clue collected</div>
            <div className="mt-2 text-base font-medium">{activeClue.title}</div>
            <p className="mt-1 text-sm leading-6 text-white/58">{activeClue.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/86 p-4 backdrop-blur-xl md:p-8"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              className="absolute right-5 top-5 rounded-lg border border-white/15 bg-white/8 p-3 text-white/70"
              onClick={() => setLightbox(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex h-full items-center justify-center">
              <img src={lightbox.url} alt={lightbox.alt} className="max-h-full max-w-full rounded-lg object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
