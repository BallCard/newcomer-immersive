import { motion } from 'motion/react';
import { ArrowRight, Lock, MapPin } from 'lucide-react';
import type { Chapter } from '../types/story';
import { paragraphImages } from '../data/images';
import { playHoverSound } from '../lib/audio';

interface ChapterSelectorProps {
  chapters: Chapter[];
  unlockedChapters: string[];
  completedChapters: string[];
  collectedClues: string[];
  onSelectChapter: (chapterId: string) => void;
  soundEnabled?: boolean;
}

function getPreviewImage(chapter: Chapter) {
  const paragraph = chapter.paragraphs.find((p) => paragraphImages[p.id]);
  return paragraph ? paragraphImages[paragraph.id] : null;
}

function getPerspectiveLabel(perspective: Chapter['perspective']) {
  return perspective === 'kaga' ? '加贺收束' : '街区证词';
}

export function ChapterSelector({
  chapters,
  unlockedChapters,
  completedChapters,
  collectedClues,
  onSelectChapter,
  soundEnabled = true,
}: ChapterSelectorProps) {
  const isUnlocked = (chapterId: string) => unlockedChapters.includes(chapterId);
  const isComplete = (chapterId: string) => completedChapters.includes(chapterId);
  const totalRequired = chapters.reduce((sum, chapter) => sum + chapter.requiredClues.length, 0);

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.3em] text-amber/70">Ningyocho Route</div>
            <h2 className="serif mt-3 max-w-3xl text-[clamp(2.4rem,6vw,5.6rem)] font-semibold leading-none tracking-normal">
              九个店铺，拼出一条最后的步行路线。
            </h2>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-white/36">Read</div>
                <div className="serif mt-2 text-3xl font-semibold">{completedChapters.length}</div>
              </div>
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-white/36">Open</div>
                <div className="serif mt-2 text-3xl font-semibold">{unlockedChapters.length}</div>
              </div>
              <div>
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-white/36">Clues</div>
                <div className="serif mt-2 text-3xl font-semibold">{collectedClues.length}</div>
              </div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber via-frost to-crimson"
                style={{ width: `${Math.round((collectedClues.length / Math.max(totalRequired, 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {chapters.map((chapter, index) => {
            const unlocked = isUnlocked(chapter.id);
            const complete = isComplete(chapter.id);
            const preview = getPreviewImage(chapter);
            const requiredCollected = chapter.requiredClues.filter((id) => collectedClues.includes(id)).length;
            const first = chapter.paragraphs[0]?.content ?? '';

            return (
              <motion.button
                key={chapter.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onMouseEnter={() => soundEnabled && playHoverSound()}
                onClick={() => unlocked && onSelectChapter(chapter.id)}
                className={`group relative min-h-[390px] overflow-hidden rounded-lg border text-left transition duration-300 ${
                  unlocked ? 'cursor-pointer border-white/12 hover:-translate-y-1 hover:border-amber/35' : 'cursor-not-allowed border-white/8 opacity-45'
                }`}
              >
                {preview && (
                  <img
                    src={preview.url}
                    alt={preview.alt}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,7,0.08),rgba(5,7,7,0.86)_62%,rgba(5,7,7,0.96))]" />

                <div className="relative z-10 flex h-full min-h-[390px] flex-col justify-between p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-lg border border-white/12 bg-black/30 px-3 py-2 backdrop-blur-md">
                      <div className="mono text-[10px] uppercase tracking-[0.22em] text-white/48">Chapter</div>
                      <div className="serif text-3xl font-semibold">{String(index + 1).padStart(2, '0')}</div>
                    </div>
                    {!unlocked && (
                      <span className="rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-white/60">
                        <Lock className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 mono text-[10px] uppercase tracking-[0.24em] text-amber/70">
                      <MapPin className="h-3.5 w-3.5" />
                      {getPerspectiveLabel(chapter.perspective)}
                    </div>
                    <h3 className="serif text-3xl font-semibold leading-tight">{unlocked ? chapter.title : '未解锁章节'}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/70">
                      {unlocked ? first : '先完成上一家店的证据链，再进入这里。'}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-white/60">
                      <span className="rounded-lg border border-white/12 bg-black/25 px-3 py-1.5">{chapter.paragraphs.length}段</span>
                      <span className="rounded-lg border border-white/12 bg-black/25 px-3 py-1.5">{requiredCollected}/{chapter.requiredClues.length}门槛</span>
                      {complete && <span className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-emerald-200">已读</span>}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                        {unlocked ? 'Open file' : 'Locked'}
                      </span>
                      {unlocked && <ArrowRight className="h-4 w-4 text-amber/80" />}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
