# 《新参者》短上下文故事 Skill

## Source

- PDF: `D:\ClaudeCode2.0\suspect-x-total\gpttest\新参者 (东野圭吾作品) (东野圭吾) (z-library.sk, 1lib.sk, z-lib.sk).pdf`
- Extracted text: `D:\ClaudeCode2.0\suspect-x-total\gpttest\newcomer.txt`
- Web project: `D:\ClaudeCode2.0\suspect-x-total\gpttest\newcomer-immersive`

## Story Model

《新参者》的核心不是密室机关，而是加贺恭一郎作为“新来的刑警”进入人形町，把每家小店的日常证词接成一条人际证据链。九章分别对应九个店铺或视角：

1. 仙贝店的女孩
2. 料亭的小伙计
3. 陶瓷器店的媳妇
4. 钟表店的狗
5. 西饼店的店员
6. 翻译家的朋友
7. 保洁公司的社长
8. 民间艺术品店的顾客
9. 日本桥的刑警

## Adaptation Rules

- 正文使用改写和概括，不长段复制原文。
- 每章保留一个街区场景图，图片与章节主题绑定。
- 线索不是“谜题提示”，而是加贺如何把日常细节转成证据。
- 解锁链按原书章节顺序推进，允许回看已解锁章节。
- 首页第一屏必须直接呈现《新参者》和人形町，不做泛泛介绍页。

## Verification Checklist

- `chapters.length === 9`
- 第一章是 `senbei-girl`
- 最后一章是 `nihonbashi-detective`
- 每条 clue 的 `triggerParagraph` 必须对应同章节段落的 `clueTrigger`
- 每章至少有一张生成图
- `docs/story-skill.md` 和 `../newcomer.txt` 必须存在
