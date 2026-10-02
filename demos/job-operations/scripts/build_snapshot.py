#!/usr/bin/env python3
"""Build a public, synthetic-only snapshot with SQLite standard library."""
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
seed = json.loads((DATA / "seed.json").read_text())
assert seed["dataset"] == "FICTIONAL_DEMO_ONLY"
assert len(seed["raw_leads"]) >= 2
assert len(seed["events"]) >= 2
opportunity_ids = {row["opportunity_id"] for row in seed["raw_leads"]}
for row in seed["raw_leads"]:
    assert row["source_id"].startswith("SYN-")
    assert row["opportunity_id"].startswith("SYN-")
    assert "Demo" in row["company"]
    assert not any("@" in str(value) or "http" in str(value) for value in row.values())
for event in seed["events"]:
    assert event["opportunity_id"] in opportunity_ids
    assert event["evidence"].startswith("Synthetic ")
    assert event["stage"] in {"DISCOVERED", "QUALIFIED", "MATERIALS_READY", "SENT_CONFIRMED", "REPLIED", "EXCLUDED"}

db = sqlite3.connect(":memory:")
db.row_factory = sqlite3.Row
db.executescript((DATA / "schema.sql").read_text())
db.executemany("INSERT INTO raw_leads VALUES (:source_id,:opportunity_id,:company,:role,:source,:fit,:reason,:next_action)", seed["raw_leads"])
db.executemany("INSERT INTO events VALUES (:opportunity_id,:seq,:stage,:evidence)", seed["events"])
rows = [dict(row) for row in db.execute((DATA / "report.sql").read_text())]
metrics = dict(db.execute((DATA / "metrics.sql").read_text()).fetchone())
for row in rows:
    row["events"] = [dict(event) for event in db.execute(
        "SELECT seq,stage,evidence FROM events WHERE opportunity_id=? ORDER BY seq", (row["opportunity_id"],)
    )]
    stages = [event["stage"] for event in row["events"]]
    if row["stage"] == "REPLIED":
        assert "SENT_CONFIRMED" in stages
    if row["stage"] == "SENT_CONFIRMED":
        assert "MATERIALS_READY" in stages
    if row["stage"] == "EXCLUDED":
        assert "SENT_CONFIRMED" not in stages
assert metrics == {"raw_leads": 6, "unique_opportunities": 5, "excluded": 1, "eligible": 4, "confirmed_sends": 2, "replies": 1}
output = {"dataset": seed["dataset"], "as_of": seed["as_of"], "metrics": metrics, "opportunities": rows}
(DATA / "snapshot.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
print("Synthetic snapshot built:", metrics)
