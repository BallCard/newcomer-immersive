import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, MapPin, Search, X } from 'lucide-react';
import type { Chapter, Clue } from '../types/story';

interface CluePanelProps {
  clues: Clue[];
  chapters: Chapter[];
  collectedClueIds: string[];
  unlockedChapterIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

function getImportanceLabel(importance: Clue['importance']) {
  if (importance === 'critical') return '关键';
  if (importance === 'important') return '重要';
  return '补充';
}

export function CluePanel({
  clues,
  chapters,
  collectedClueIds,
  unlockedChapterIds,
  isOpen,
  onClose,
}: CluePanelProps) {
  const collected = useMemo(
    () => clues.filter((clue) => collectedClueIds.includes(clue.id)),
    [clues, collectedClueIds],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/64 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed right-0 top-0 z-[100] h-full w-full max-w-[540px] overflow-y-auto border-l border-white/10 bg-[#0b0d0b]/96 backdrop-blur-2xl"
          >
            <div className="sticky top-0 z-10 border-b border-white/8 bg-[#0b0d0b]/92 px-6 py-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.28em] text-amber/70">Case ledger</div>
                  <h2 className="serif mt-2 text-3xl font-semibold">人形町案卷</h2>
                  <p className="mt-2 text-sm leading-6 text-white/56">
                    这里汇总已发现线索和章节门槛，用来复盘加贺如何从街区日常里收束命案。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/12 bg-white/[0.04] p-2 text-white/58 transition hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ['Collected', collected.length],
                  ['Locked', clues.length - collected.length],
                  ['Open', unlockedChapterIds.length],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="mono text-[10px] uppercase tracking-[0.2em] text-white/36">{label}</div>
                    <div className="serif mt-2 text-3xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.24em] text-white/38">
                  <Search className="h-4 w-4 text-amber/75" />
                  Collected evidence
                </div>

                <div className="mt-4 space-y-3">
                  {collected.map((clue) => (
                    <div key={clue.id} className="rounded-lg border border-white/10 bg-black/16 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-medium text-ink">{clue.title}</div>
                          <p className="mt-2 text-xs leading-6 text-white/54">{clue.description}</p>
                        </div>
                        <span className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] tracking-[0.16em] ${
                          clue.importance === 'critical'
                            ? 'border-red-400/25 text-red-200'
                            : clue.importance === 'important'
                              ? 'border-amber/25 text-amber'
                              : 'border-white/12 text-white/42'
                        }`}>
                          {getImportanceLabel(clue.importance)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {collected.length === 0 && (
                    <div className="rounded-lg border border-dashed border-white/12 bg-black/10 p-5 text-sm text-white/42">
                      阅读正文后，线索会自动进入案卷。
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.24em] text-white/38">
                  <Lock className="h-4 w-4 text-frost/80" />
                  Chapter locks
                </div>

                <div className="mt-4 space-y-3">
                  {chapters.map((chapter) => {
                    const unlocked = unlockedChapterIds.includes(chapter.id);
                    const matchedRequired = chapter.requiredClues.filter((id) => collectedClueIds.includes(id)).length;

                    return (
                      <div
                        key={chapter.id}
                        className={`rounded-lg border p-4 transition ${unlocked ? 'border-white/10 bg-black/16' : 'border-white/8 bg-black/8 opacity-65'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-ink">
                              <MapPin className="h-4 w-4 text-amber/70" />
                              {chapter.title}
                            </div>
                            <p className="mt-1 text-xs text-white/45">
                              {matchedRequired}/{chapter.requiredClues.length} 个门槛线索
                            </p>
                          </div>
                          <span className={`rounded-lg border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${unlocked ? 'border-emerald-400/25 text-emerald-200' : 'border-white/10 text-white/38'}`}>
                            {unlocked ? 'Open' : 'Locked'}
                          </span>
                        </div>
                        <div className="mt-3 h-1.5 rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber via-frost to-crimson"
                            style={{ width: `${chapter.requiredClues.length ? Math.round((matchedRequired / chapter.requiredClues.length) * 100) : 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
