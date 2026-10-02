WITH ranked AS (
  SELECT raw_leads.*, ROW_NUMBER() OVER (PARTITION BY opportunity_id ORDER BY source_id) AS rn
  FROM raw_leads
), latest AS (
  SELECT opportunity_id, stage, ROW_NUMBER() OVER (PARTITION BY opportunity_id ORDER BY seq DESC) AS rn
  FROM events
), sources AS (
  SELECT opportunity_id, GROUP_CONCAT(source, ' + ') AS all_sources, COUNT(*) AS source_count
  FROM raw_leads GROUP BY opportunity_id
)
SELECT ranked.opportunity_id, ranked.company, ranked.role, ranked.fit,
       ranked.reason, ranked.next_action, sources.all_sources, sources.source_count,
       latest.stage
FROM ranked
JOIN latest ON latest.opportunity_id = ranked.opportunity_id AND latest.rn = 1
JOIN sources ON sources.opportunity_id = ranked.opportunity_id
WHERE ranked.rn = 1
ORDER BY ranked.opportunity_id;
