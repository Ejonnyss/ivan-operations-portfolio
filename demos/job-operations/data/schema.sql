CREATE TABLE raw_leads (
  source_id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  source TEXT NOT NULL,
  fit TEXT NOT NULL,
  reason TEXT NOT NULL,
  next_action TEXT NOT NULL
);
CREATE TABLE events (
  opportunity_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  stage TEXT NOT NULL,
  evidence TEXT NOT NULL,
  PRIMARY KEY (opportunity_id, seq)
);
