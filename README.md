# 新参者 Immersive Reader

这是《新参者》的沉浸式互动网页版本。项目把原书压缩为一条可阅读、可复盘、可验证的人形町证据链：九章、十九张生成场景图、二十七条线索、环境音效、阅读进度和终章电影谢幕场景。

## 在线体验

- GitHub Pages: https://ballcard.github.io/newcomer-immersive/
- 国内友好版: https://6ysfsmkh9d.coze.site

> 如果在微信内置浏览器中加载较慢，建议复制链接到系统浏览器打开。

## 运行

```bash
npm install
npm run dev
```

默认地址：`http://localhost:3000`

## 验证

```bash
npm run lint
npm run validate
npm run build
```

`validate` 会检查章节解锁链、线索触发、图片文件、章节图片覆盖和本地压缩故事文档。

## 结构

- `src/data/chapters.ts`：章节、正文段落、线索和解锁链
- `src/data/images.ts`：段落到生成图片的映射
- `public/images`：章节主图、细节镜头和谢幕图
- `docs/story-skill.md`：短上下文故事 skill
- `scripts/validate-story.cjs`：完整性校验
