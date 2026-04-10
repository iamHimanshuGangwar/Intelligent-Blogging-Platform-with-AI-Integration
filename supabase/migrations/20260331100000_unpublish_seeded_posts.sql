-- Un-publish seeded / mock / demo blog posts.
-- Keeps records for audit/history and moves them out of public feeds.

UPDATE posts
SET
	status = 'draft',
	updated_at = now()
WHERE
	status = 'published'
	AND (
		author_id NOT IN (SELECT id FROM profiles)
		OR author_id LIKE 'otp_%'
		OR lower(coalesce(title, '')) LIKE '%lorem ipsum%'
		OR lower(coalesce(title, '')) LIKE '%sample post%'
		OR lower(coalesce(title, '')) LIKE '%test post%'
		OR lower(coalesce(title, '')) LIKE '%demo post%'
		OR lower(coalesce(title, '')) LIKE '%placeholder%'
		OR lower(coalesce(excerpt, '')) LIKE '%lorem ipsum%'
	);
