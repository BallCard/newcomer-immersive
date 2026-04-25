import { useCallback, useEffect, useState } from 'react';
import type { UserProgress } from '../types/story';

const STORAGE_KEY = 'newcomer-immersive-progress';

const defaultProgress: UserProgress = {
  unlockedChapters: ['senbei-girl'],
  collectedClues: [],
  currentChapter: null,
  completedChapters: [],
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<UserProgress>;
        return { ...defaultProgress, ...parsed };
      }
    } catch {
      // Start fresh when localStorage is unavailable or corrupted.
    }
    return defaultProgress;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const unlockChapter = useCallback((chapterId: string) => {
    setProgress((prev) => {
      if (prev.unlockedChapters.includes(chapterId)) return prev;
      return { ...prev, unlockedChapters: [...prev.unlockedChapters, chapterId] };
    });
  }, []);

  const collectClue = useCallback((clueId: string) => {
    setProgress((prev) => {
      if (prev.collectedClues.includes(clueId)) return prev;
      return { ...prev, collectedClues: [...prev.collectedClues, clueId] };
    });
  }, []);

  const completeChapter = useCallback((chapterId: string) => {
    setProgress((prev) => {
      if (prev.completedChapters.includes(chapterId)) return prev;
      return {
        ...prev,
        completedChapters: [...prev.completedChapters, chapterId],
        currentChapter: null,
      };
    });
  }, []);

  const setCurrentChapter = useCallback((chapterId: string | null) => {
    setProgress((prev) => ({ ...prev, currentChapter: chapterId }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
  }, []);

  return {
    progress,
    unlockChapter,
    collectClue,
    completeChapter,
    setCurrentChapter,
    resetProgress,
  };
}
