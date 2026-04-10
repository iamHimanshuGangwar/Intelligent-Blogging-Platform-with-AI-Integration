-- Move smoke/verification placeholder posts out of public feeds.
-- We keep records for audit/history, but mark them as draft.

UPDATE posts
SET
  status = 'draft',
  updated_at = now()
WHERE
  status = 'published'
  AND (
    lower(coalesce(category, '')) LIKE '%smoke%'
    OR lower(coalesce(category, '')) LIKE '%verification%'
    OR lower(coalesce(topic, '')) LIKE '%smoke verification%'
    OR lower(coalesce(title, '')) LIKE '%smoke verification%'
    OR lower(coalesce(title, '')) LIKE '%test post%'
    OR lower(coalesce(title, '')) LIKE '%dummy%'
    OR lower(coalesce(title, '')) LIKE '%placeholder%'
  );
