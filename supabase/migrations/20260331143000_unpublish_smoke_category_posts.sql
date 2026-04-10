-- Move smoke category/test verification posts out of public feeds.
-- Keeps records for traceability while removing them from published cards.

UPDATE posts
SET
  status = 'draft',
  updated_at = now()
WHERE
  status = 'published'
  AND (
    lower(coalesce(title, '')) LIKE 'smoke category post%'
    OR lower(coalesce(title, '')) LIKE '%smoke verification%'
    OR lower(coalesce(title, '')) LIKE '%verification post%'
    OR lower(coalesce(title, '')) LIKE '%sample post%'
    OR lower(coalesce(title, '')) LIKE '%seeded post%'
    OR lower(coalesce(title, '')) LIKE '%dummy%'
    OR lower(coalesce(title, '')) LIKE '%placeholder%'
    OR lower(coalesce(excerpt, '')) LIKE '%smoke category%'
    OR lower(coalesce(content, '')) LIKE '%smoke verification%'
  );
