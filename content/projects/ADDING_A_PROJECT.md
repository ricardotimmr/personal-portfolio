# How To Add A New Project

This is the exact workflow for this repo.

## 1) Add the project content record

Edit `src/content/projects/projects.json` and append a new object.

Use this template:

```json
{
  "id": "project-13",
  "slug": "my-new-project",
  "title": "My New Project",
  "orientation": "landscape",
  "description": "Short project description shown in Work + Project detail header.",
  "roles": ["Frontend Developer", "UI Designer"],
  "visitUrl": "https://example.com",
  "detail": {
    "overviewHeadline": "Overview headline text.",
    "overviewMeta": "Overview supporting text.",
    "processHeadline": "Process headline text.",
    "processMeta": "Process supporting text."
  },
  "assets": {
    "folder": "my-new-project",
    "fallbackThumbnail": "maico-amorim-SJWPKMb9u-k-unsplash.jpg",
    "fallbackDetails": [
      "rene-wild-Oh3vQqRu0WU-unsplash.jpg",
      "willian-justen-de-vasconcellos-nrO1MdlNelA-unsplash.jpg",
      "atul-pandey-Mrhk78uramI-unsplash.jpg",
      "martina-nette-uBjBr9CvNiw-unsplash.jpg"
    ]
  }
}
```

Notes:
- `id` and `slug` must be unique.
- `orientation` must be `landscape` or `portrait`.
- `assets.folder` should usually match `slug`.
- `fallbackThumbnail`/`fallbackDetails` are only fallback files if generated images are missing.

## 2) Add raw images (5 files total)

Create this folder:

`content/projects/raw/<slug>/`

Example:

```bash
mkdir -p content/projects/raw/my-new-project
```

Add these exact filenames (extension can vary):
- `thumbnail.<ext>`
- `detail-01.<ext>`
- `detail-02.<ext>`
- `detail-03.<ext>`
- `detail-04.<ext>`

Important:
- The `thumbnail` image is used in both places:
1. Work page project card image
2. Project detail hero image
- There is no separate `hero` source file.

## 3) Run optimizer pipeline

```bash
npm run optimize:projects
```

What it does:
- Reads `content/projects/raw/<slug>/...`
- Generates responsive `.avif`, `.webp`, `.jpg` variants into:
  - `src/assets/projects/generated/<slug>/`
- Copies originals to non-bundled archive:
  - `content/projects/archive/<slug>/`
- Enforces source limits (size and dimensions).

Optional targeted updates:

```bash
# Optimize one project only
npm run optimize:projects -- --project my-new-project

# Optimize one slot only for one project
npm run optimize:projects -- --project my-new-project --slot detail-03

# Optimize multiple slots only for one project
npm run optimize:projects -- --project my-new-project --slot thumbnail,detail-01
```

Notes:
- The optimizer replaces only the targeted slot variants for the project.
- Other existing generated slots remain untouched.

## 4) Verify in app

```bash
npm run dev
```

Check:
- Work page card image renders.
- Project detail hero renders (same source as thumbnail, different responsive sizing).
- 4 detail images render.
- Description, roles, visit URL, and text blocks render.

## 5) Final checks

```bash
npm run lint
npm run build
```

## Troubleshooting

- Images not updating:
1. Confirm `assets.folder` equals your raw folder name.
2. Confirm exact filenames: `thumbnail`, `detail-01..04`.
3. Re-run `npm run optimize:projects`.

- Broken fallback image:
1. Check `fallbackThumbnail` and `fallbackDetails` filenames exist in legacy asset folders.

- Optimizer fails on file limits:
1. Reduce source image dimensions/filesize.
2. Re-run optimizer.
