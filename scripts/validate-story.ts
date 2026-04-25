import fs from 'node:fs';
import path from 'node:path';
import { chapters, clues } from '../src/data/chapters';
import { paragraphImages } from '../src/data/images';

const projectRoot = process.cwd();
const errors: string[] = [];
const warnings: string[] = [];

function assert(condition: unknown, message: string) {
  if (!condition) errors.push(message);
}

function resolveAsset(url: string) {
  return path.join(projectRoot, 'public', url.replace(/^\//, ''));
}

const chapterIds = new Set(chapters.map((chapter) => chapter.id));
const clueIds = new Set(clues.map((clue) => clue.id));
const paragraphIds = new Set(chapters.flatMap((chapter) => chapter.paragraphs.map((paragraph) => paragraph.id)));
const imageUrls = new Set<string>();

assert(chapters.length === 9, `Expected 9 chapters, got ${chapters.length}.`);
assert(chapters[0]?.id === 'senbei-girl', 'First chapter should be 仙贝店的女孩.');
assert(chapters.at(-1)?.id === 'nihonbashi-detective', 'Last chapter should be 日本桥的刑警.');

for (const chapter of chapters) {
  assert(chapter.paragraphs.length >= 5, `Chapter ${chapter.id} is too thin.`);

  if (chapter.unlocksChapter) {
    assert(chapterIds.has(chapter.unlocksChapter), `Chapter ${chapter.id} unlocks missing chapter ${chapter.unlocksChapter}.`);
  }

  for (const clueId of chapter.requiredClues) {
    assert(clueIds.has(clueId), `Chapter ${chapter.id} references missing required clue ${clueId}.`);
  }

  for (const paragraph of chapter.paragraphs) {
    if (paragraph.clueTrigger) {
      assert(clueIds.has(paragraph.clueTrigger), `Paragraph ${paragraph.id} references missing clue trigger ${paragraph.clueTrigger}.`);
    }
  }
}

for (const clue of clues) {
  assert(chapterIds.has(clue.chapterId), `Clue ${clue.id} targets missing chapter ${clue.chapterId}.`);
  const chapter = chapters.find((item) => item.id === clue.chapterId);
  if (chapter) {
    assert(clue.triggerParagraph >= 1 && clue.triggerParagraph <= chapter.paragraphs.length, `Clue ${clue.id} triggerParagraph is out of range for ${chapter.id}.`);
    const paragraph = chapter.paragraphs[clue.triggerParagraph - 1];
    assert(paragraph?.clueTrigger === clue.id, `Clue ${clue.id} trigger does not match paragraph ${clue.triggerParagraph} in ${chapter.id}.`);
  }
}

for (const [paragraphId, asset] of Object.entries(paragraphImages)) {
  assert(paragraphIds.has(paragraphId), `Image mapped to unknown paragraph ${paragraphId}.`);
  const assetPath = resolveAsset(asset.url);
  assert(fs.existsSync(assetPath), `Missing image file: ${asset.url}`);
  imageUrls.add(asset.url);
}

for (let index = 1; index <= 9; index += 1) {
  const prefix = `/images/0${index}_`;
  assert([...imageUrls].some((url) => url.startsWith(prefix)), `Missing generated image for chapter ${index}.`);
}

const startChapter = chapters[0];
if (startChapter) {
  const visited = new Set<string>();
  let cursor: string | undefined = startChapter.id;
  while (cursor && !visited.has(cursor)) {
    visited.add(cursor);
    cursor = chapters.find((chapter) => chapter.id === cursor)?.unlocksChapter;
  }
  const unreachable = chapters.filter((chapter) => !visited.has(chapter.id)).map((chapter) => chapter.id);
  assert(unreachable.length === 0, `Unreachable chapters in unlock chain: ${unreachable.join(', ')}`);
} else {
  errors.push('No chapters were loaded.');
}

const localSource = path.join(projectRoot, '..', 'newcomer.txt');
if (!fs.existsSync(localSource)) {
  warnings.push(`Local PDF text extraction not found at ${localSource}`);
}

const storySkill = path.join(projectRoot, 'docs', 'story-skill.md');
if (!fs.existsSync(storySkill)) {
  errors.push(`Missing compressed story skill at ${storySkill}`);
}

const totalParagraphs = chapters.reduce((sum, chapter) => sum + chapter.paragraphs.length, 0);
const imageCoverage = Object.keys(paragraphImages).length;

if (errors.length > 0) {
  console.error('Story validation failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Story validation passed.');
console.log(`- chapters: ${chapters.length}`);
console.log(`- paragraphs: ${totalParagraphs}`);
console.log(`- clues: ${clues.length}`);
console.log(`- image mappings: ${imageCoverage}`);
console.log(`- generated image files: ${imageUrls.size}`);

if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}
