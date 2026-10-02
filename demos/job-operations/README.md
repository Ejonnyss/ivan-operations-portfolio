# Job Operations reviewer ledger

Read-only, fictional pipeline sample. No production CRM data, real employer, resume, contact or correspondence is imported. The interface makes no application and contains no credentials.

## Rebuild and preview

From the portfolio repository root:

```sh
python3 demos/job-operations/scripts/build_snapshot.py
python3 -m http.server 4176
```

Open `http://127.0.0.1:4176/demos/job-operations/`.

## Architecture

`data/seed.json` has six fictional source rows for five fictional opportunities and a separate event trail. The generator loads them into in-memory SQLite using `schema.sql`, selects canonical opportunities with `ROW_NUMBER()` in `report.sql`, computes metrics in `metrics.sql`, validates the synthetic-data contract and writes `data/snapshot.json`. The browser only fetches that generated JSON, filters records and displays evidence. It cannot edit data or connect to the private Job Agent.

The sample deliberately distinguishes a prepared draft, a simulated confirmed send and a simulated reply. Its counts describe the sample alone. They must not be presented as actual application or response results.

Codex generated the code and queries for this reviewer demo. Ivan's role is product/process direction, review of state semantics and acceptance. The demo does not substantiate independent SQL engineering by Ivan.
