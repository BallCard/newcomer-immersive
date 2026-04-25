export type Perspective = 'neighborhood' | 'kaga';

export interface Clue {
  id: string;
  title: string;
  description: string;
  chapterId: string;
  perspective: Perspective;
  triggerParagraph: number;
  importance: 'critical' | 'important' | 'minor';
}

export interface Paragraph {
  id: string;
  content: string;
  clueTrigger?: string;
}

export interface Chapter {
  id: string;
  title: string;
  perspective: Perspective;
  chapterNumber: number;
  paragraphs: Paragraph[];
  requiredClues: string[];
  unlocksChapter?: string;
}

export interface UserProgress {
  unlockedChapters: string[];
  collectedClues: string[];
  currentChapter: string | null;
  completedChapters: string[];
}
