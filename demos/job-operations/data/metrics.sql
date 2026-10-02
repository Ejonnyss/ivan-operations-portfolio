WITH latest AS (
  SELECT opportunity_id, stage, ROW_NUMBER() OVER (PARTITION BY opportunity_id ORDER BY seq DESC) AS rn
  FROM events
), canonical AS (
  SELECT opportunity_id FROM raw_leads GROUP BY opportunity_id
)
SELECT
  (SELECT COUNT(*) FROM raw_leads) AS raw_leads,
  (SELECT COUNT(*) FROM canonical) AS unique_opportunities,
  SUM(CASE WHEN latest.stage = 'EXCLUDED' THEN 1 ELSE 0 END) AS excluded,
  SUM(CASE WHEN latest.stage IN ('QUALIFIED','MATERIALS_READY','SENT_CONFIRMED','REPLIED') THEN 1 ELSE 0 END) AS eligible,
  SUM(CASE WHEN latest.stage IN ('SENT_CONFIRMED','REPLIED') THEN 1 ELSE 0 END) AS confirmed_sends,
  SUM(CASE WHEN latest.stage = 'REPLIED' THEN 1 ELSE 0 END) AS replies
FROM canonical JOIN latest ON latest.opportunity_id = canonical.opportunity_id AND latest.rn = 1;
