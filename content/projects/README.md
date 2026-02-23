# Project Media Pipeline

This folder keeps original project media out of the web bundle.

## Upload workflow

1. Add/update project metadata in `src/content/projects/projects.json`.
2. Create a folder in `content/projects/raw/<project-slug>/`.
3. Add source images using this exact slot naming:
- `thumbnail.<ext>`
- `detail-01.<ext>`
- `detail-02.<ext>`
- `detail-03.<ext>`
- `detail-04.<ext>`
4. Run `npm run optimize:projects`.

## Output

- Optimized responsive variants are written to `src/assets/projects/generated/<project-slug>/`.
- Original uploads are copied to `content/projects/archive/<project-slug>/` as a non-bundled archive.
- The same `thumbnail` source is used for both the Work card image and the Project page hero image.

## Notes

- The app falls back to legacy project images when generated variants for a slot are missing.
- Source images over configured limits fail optimization (enforced in `scripts/optimize-project-images.mjs`).
