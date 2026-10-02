# Ivan Epifanov — Operations × AI × Product

Static portfolio and reviewer sandbox. The site has no build step and no external analytics, fonts, API calls or personal-data backend.

The English and Russian portfolio pages have canonical, language-alternate and share metadata. `assets/social-preview.png` is generated with `python3 scripts/build_social_preview.py` (Pillow and standard macOS fonts). The two fictional reviewer demos carry `noindex,follow`; their case studies remain indexable.

## Local preview

```sh
python3 -m http.server 4176
```

Open `http://127.0.0.1:4176/` for English or `/ru/` for Russian. Both versions have case pages; the live demos use their original interface languages. The KadrLine reviewer sandbox persists only in the visitor's browser. Use **Reset sandbox** to delete its local record.

## Evidence and boundaries

- LIFE: REBUILD links to a separately deployed synthetic demo. The screenshot is from that demo.
- KadrLine sandbox is a new illustrative workflow; it does not reproduce the commercial risk scoring or call a production integration.
- Job operations has a separate static reviewer ledger built from six fictional source rows and evidence events. Its SQLite generator is in `demos/job-operations/scripts/`; production CRM, correspondence and employer data are not in this repository.
- Codex contributed implementation and QA. The owner retains product decisions and acceptance.

See the individual case pages for exact test and release status. No impact metric is inferred from a successful build.

Public architecture notes: [LIFE v3](technical/life-v3.md), [KadrLine](technical/kadrline.md), and the [Job Operations demo](demos/job-operations/README.md). The [AI-assisted delivery evidence trail](technical/ai-delivery-model.md) also has a [Russian version](technical/ai-delivery-model.ru.md). The LIFE v3 source branch and KadrLine commercial source are not distributed here.
