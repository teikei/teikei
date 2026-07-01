-- ============================================================================
-- Orphan cleanup, prerequisite for 20260701120000_add_missing_foreign_keys.
--
-- Every orphan is a row in a JOIN/RELATION table that points at a parent
-- (farm, depot, user, ...) which no longer exists. The parent was already
-- deleted; these rows are dangling pointers that were never cleaned up because
-- the schema had no ON DELETE CASCADE foreign keys. Deleting them removes NO
-- live entity and no recoverable user data -- it only removes links to things
-- that are already gone. After the migration adds the FKs, this cannot recur.
--
-- HOW TO RUN (staging first, validate the app, then prod):
--   0. Take a backup:  pg_dump -Fc <db> > before_orphan_cleanup.dump
--   1. Run STEP 1 (read-only) to see what will be removed.
--   2. Run STEP 2 as one transaction; check the verification output; then
--      COMMIT (or ROLLBACK to abort -- rollback also discards the archive).
--   3. Re-run `npm run audit:fks` -> expect 0 orphans.
--   4. Run the FK migration.
--
-- Uses full anti-joins (all FK columns of each table), so it makes each table
-- exactly satisfy its future foreign keys and is safe to re-run (0 rows when
-- already clean). The DELETEs on farms_badges / initiatives_badges will fire
-- their existing audit triggers, recording the cleanup in the `audit` table --
-- expected and harmless.
-- ============================================================================


-- ============================================================================
-- STEP 1 -- REPORT (read-only). Counts that must all become 0, plus a sample.
-- ============================================================================
SELECT 'farms_products'    AS tbl, count(*) FROM farms_products    x WHERE NOT EXISTS (SELECT 1 FROM farms       p WHERE p.id = x.farm_id)       OR NOT EXISTS (SELECT 1 FROM products       p WHERE p.id = x.product_id)
UNION ALL SELECT 'depots_users',       count(*) FROM depots_users       x WHERE NOT EXISTS (SELECT 1 FROM depots      p WHERE p.id = x.depot_id)      OR NOT EXISTS (SELECT 1 FROM users          p WHERE p.id = x.user_id)
UNION ALL SELECT 'farms_users',        count(*) FROM farms_users        x WHERE NOT EXISTS (SELECT 1 FROM farms       p WHERE p.id = x.farm_id)       OR NOT EXISTS (SELECT 1 FROM users          p WHERE p.id = x.user_id)
UNION ALL SELECT 'initiatives_users',  count(*) FROM initiatives_users  x WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id) OR NOT EXISTS (SELECT 1 FROM users          p WHERE p.id = x.user_id)
UNION ALL SELECT 'farms_depots',       count(*) FROM farms_depots       x WHERE NOT EXISTS (SELECT 1 FROM farms       p WHERE p.id = x.farm_id)       OR NOT EXISTS (SELECT 1 FROM depots         p WHERE p.id = x.depot_id)
UNION ALL SELECT 'initiatives_goals',  count(*) FROM initiatives_goals  x WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id) OR NOT EXISTS (SELECT 1 FROM goals          p WHERE p.id = x.goal_id)
UNION ALL SELECT 'users_roles',        count(*) FROM users_roles        x WHERE NOT EXISTS (SELECT 1 FROM users       p WHERE p.id = x.user_id)       OR NOT EXISTS (SELECT 1 FROM roles          p WHERE p.id = x.role_id)
UNION ALL SELECT 'farms_badges',       count(*) FROM farms_badges       x WHERE NOT EXISTS (SELECT 1 FROM farms       p WHERE p.id = x.farm_id)       OR NOT EXISTS (SELECT 1 FROM badges         p WHERE p.id = x.badge_id)
UNION ALL SELECT 'initiatives_badges', count(*) FROM initiatives_badges x WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id) OR NOT EXISTS (SELECT 1 FROM badges         p WHERE p.id = x.badge_id)
UNION ALL SELECT 'email_messages',     count(*) FROM email_messages     x WHERE NOT EXISTS (SELECT 1 FROM users       p WHERE p.id = x.user_id)       OR NOT EXISTS (SELECT 1 FROM email_campaigns p WHERE p.id = x.campaign_id)
UNION ALL SELECT 'admins_origins',     count(*) FROM admins_origins     x WHERE NOT EXISTS (SELECT 1 FROM users       p WHERE p.id = x.user_id)       OR NOT EXISTS (SELECT 1 FROM origins        p WHERE p.id = x.origin_id)
ORDER BY 1;


-- ============================================================================
-- STEP 2 -- ARCHIVE + DELETE (transactional). Review the verification output
-- at the end, then COMMIT or ROLLBACK.
-- ============================================================================
BEGIN;

CREATE SCHEMA IF NOT EXISTS orphan_archive;

-- farms_products (orphaned farm_id)
DROP TABLE IF EXISTS orphan_archive.farms_products;
CREATE TABLE orphan_archive.farms_products AS
  SELECT * FROM farms_products x
  WHERE NOT EXISTS (SELECT 1 FROM farms p WHERE p.id = x.farm_id)
     OR NOT EXISTS (SELECT 1 FROM products p WHERE p.id = x.product_id);
DELETE FROM farms_products x
  WHERE NOT EXISTS (SELECT 1 FROM farms p WHERE p.id = x.farm_id)
     OR NOT EXISTS (SELECT 1 FROM products p WHERE p.id = x.product_id);

-- depots_users (orphaned depot_id / user_id)
DROP TABLE IF EXISTS orphan_archive.depots_users;
CREATE TABLE orphan_archive.depots_users AS
  SELECT * FROM depots_users x
  WHERE NOT EXISTS (SELECT 1 FROM depots p WHERE p.id = x.depot_id)
     OR NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id);
DELETE FROM depots_users x
  WHERE NOT EXISTS (SELECT 1 FROM depots p WHERE p.id = x.depot_id)
     OR NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id);

-- farms_users (orphaned farm_id / user_id)
DROP TABLE IF EXISTS orphan_archive.farms_users;
CREATE TABLE orphan_archive.farms_users AS
  SELECT * FROM farms_users x
  WHERE NOT EXISTS (SELECT 1 FROM farms p WHERE p.id = x.farm_id)
     OR NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id);
DELETE FROM farms_users x
  WHERE NOT EXISTS (SELECT 1 FROM farms p WHERE p.id = x.farm_id)
     OR NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id);

-- initiatives_users (orphaned initiative_id / user_id)
DROP TABLE IF EXISTS orphan_archive.initiatives_users;
CREATE TABLE orphan_archive.initiatives_users AS
  SELECT * FROM initiatives_users x
  WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id)
     OR NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id);
DELETE FROM initiatives_users x
  WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id)
     OR NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id);

-- farms_depots (orphaned farm_id / depot_id)
DROP TABLE IF EXISTS orphan_archive.farms_depots;
CREATE TABLE orphan_archive.farms_depots AS
  SELECT * FROM farms_depots x
  WHERE NOT EXISTS (SELECT 1 FROM farms p WHERE p.id = x.farm_id)
     OR NOT EXISTS (SELECT 1 FROM depots p WHERE p.id = x.depot_id);
DELETE FROM farms_depots x
  WHERE NOT EXISTS (SELECT 1 FROM farms p WHERE p.id = x.farm_id)
     OR NOT EXISTS (SELECT 1 FROM depots p WHERE p.id = x.depot_id);

-- initiatives_goals (orphaned initiative_id)
DROP TABLE IF EXISTS orphan_archive.initiatives_goals;
CREATE TABLE orphan_archive.initiatives_goals AS
  SELECT * FROM initiatives_goals x
  WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id)
     OR NOT EXISTS (SELECT 1 FROM goals p WHERE p.id = x.goal_id);
DELETE FROM initiatives_goals x
  WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id)
     OR NOT EXISTS (SELECT 1 FROM goals p WHERE p.id = x.goal_id);

-- users_roles (orphaned user_id; NOTE: the 1 NULL role_id is handled below)
DROP TABLE IF EXISTS orphan_archive.users_roles;
CREATE TABLE orphan_archive.users_roles AS
  SELECT * FROM users_roles x
  WHERE NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id)
     OR NOT EXISTS (SELECT 1 FROM roles p WHERE p.id = x.role_id);
DELETE FROM users_roles x
  WHERE NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id)
     OR NOT EXISTS (SELECT 1 FROM roles p WHERE p.id = x.role_id);

-- farms_badges (orphaned farm_id)
DROP TABLE IF EXISTS orphan_archive.farms_badges;
CREATE TABLE orphan_archive.farms_badges AS
  SELECT * FROM farms_badges x
  WHERE NOT EXISTS (SELECT 1 FROM farms p WHERE p.id = x.farm_id)
     OR NOT EXISTS (SELECT 1 FROM badges p WHERE p.id = x.badge_id);
DELETE FROM farms_badges x
  WHERE NOT EXISTS (SELECT 1 FROM farms p WHERE p.id = x.farm_id)
     OR NOT EXISTS (SELECT 1 FROM badges p WHERE p.id = x.badge_id);

-- initiatives_badges (orphaned initiative_id)
DROP TABLE IF EXISTS orphan_archive.initiatives_badges;
CREATE TABLE orphan_archive.initiatives_badges AS
  SELECT * FROM initiatives_badges x
  WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id)
     OR NOT EXISTS (SELECT 1 FROM badges p WHERE p.id = x.badge_id);
DELETE FROM initiatives_badges x
  WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id)
     OR NOT EXISTS (SELECT 1 FROM badges p WHERE p.id = x.badge_id);

-- email_messages (orphaned user_id -- messages for already-deleted users)
DROP TABLE IF EXISTS orphan_archive.email_messages;
CREATE TABLE orphan_archive.email_messages AS
  SELECT * FROM email_messages x
  WHERE NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id)
     OR NOT EXISTS (SELECT 1 FROM email_campaigns p WHERE p.id = x.campaign_id);
DELETE FROM email_messages x
  WHERE NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id)
     OR NOT EXISTS (SELECT 1 FROM email_campaigns p WHERE p.id = x.campaign_id);

-- admins_origins (currently clean; included for completeness / re-runs)
DROP TABLE IF EXISTS orphan_archive.admins_origins;
CREATE TABLE orphan_archive.admins_origins AS
  SELECT * FROM admins_origins x
  WHERE NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id)
     OR NOT EXISTS (SELECT 1 FROM origins p WHERE p.id = x.origin_id);
DELETE FROM admins_origins x
  WHERE NOT EXISTS (SELECT 1 FROM users p WHERE p.id = x.user_id)
     OR NOT EXISTS (SELECT 1 FROM origins p WHERE p.id = x.origin_id);

-- OPTIONAL: a users_roles row with NULL role_id is not an FK violation (FKs
-- ignore NULLs) so it will NOT block the migration, but it is a meaningless
-- role assignment. Uncomment to remove it as well:
-- INSERT INTO orphan_archive.users_roles SELECT * FROM users_roles WHERE role_id IS NULL;
-- DELETE FROM users_roles WHERE role_id IS NULL;

-- ---- VERIFICATION: every orphans value below must be 0 ----
SELECT 'farms_products'    AS tbl, count(*) AS orphans FROM farms_products    x WHERE NOT EXISTS (SELECT 1 FROM farms       p WHERE p.id = x.farm_id)       OR NOT EXISTS (SELECT 1 FROM products       p WHERE p.id = x.product_id)
UNION ALL SELECT 'depots_users',       count(*) FROM depots_users       x WHERE NOT EXISTS (SELECT 1 FROM depots      p WHERE p.id = x.depot_id)      OR NOT EXISTS (SELECT 1 FROM users          p WHERE p.id = x.user_id)
UNION ALL SELECT 'farms_users',        count(*) FROM farms_users        x WHERE NOT EXISTS (SELECT 1 FROM farms       p WHERE p.id = x.farm_id)       OR NOT EXISTS (SELECT 1 FROM users          p WHERE p.id = x.user_id)
UNION ALL SELECT 'initiatives_users',  count(*) FROM initiatives_users  x WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id) OR NOT EXISTS (SELECT 1 FROM users          p WHERE p.id = x.user_id)
UNION ALL SELECT 'farms_depots',       count(*) FROM farms_depots       x WHERE NOT EXISTS (SELECT 1 FROM farms       p WHERE p.id = x.farm_id)       OR NOT EXISTS (SELECT 1 FROM depots         p WHERE p.id = x.depot_id)
UNION ALL SELECT 'initiatives_goals',  count(*) FROM initiatives_goals  x WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id) OR NOT EXISTS (SELECT 1 FROM goals          p WHERE p.id = x.goal_id)
UNION ALL SELECT 'users_roles',        count(*) FROM users_roles        x WHERE NOT EXISTS (SELECT 1 FROM users       p WHERE p.id = x.user_id)       OR NOT EXISTS (SELECT 1 FROM roles          p WHERE p.id = x.role_id)
UNION ALL SELECT 'farms_badges',       count(*) FROM farms_badges       x WHERE NOT EXISTS (SELECT 1 FROM farms       p WHERE p.id = x.farm_id)       OR NOT EXISTS (SELECT 1 FROM badges         p WHERE p.id = x.badge_id)
UNION ALL SELECT 'initiatives_badges', count(*) FROM initiatives_badges x WHERE NOT EXISTS (SELECT 1 FROM initiatives p WHERE p.id = x.initiative_id) OR NOT EXISTS (SELECT 1 FROM badges         p WHERE p.id = x.badge_id)
UNION ALL SELECT 'email_messages',     count(*) FROM email_messages     x WHERE NOT EXISTS (SELECT 1 FROM users       p WHERE p.id = x.user_id)       OR NOT EXISTS (SELECT 1 FROM email_campaigns p WHERE p.id = x.campaign_id)
UNION ALL SELECT 'admins_origins',     count(*) FROM admins_origins     x WHERE NOT EXISTS (SELECT 1 FROM users       p WHERE p.id = x.user_id)       OR NOT EXISTS (SELECT 1 FROM origins        p WHERE p.id = x.origin_id)
ORDER BY 1;

-- Archived row counts (what STEP 2 removed) -- sanity-check against STEP 1:
SELECT 'farms_products' AS tbl, count(*) AS archived FROM orphan_archive.farms_products
UNION ALL SELECT 'depots_users',       count(*) FROM orphan_archive.depots_users
UNION ALL SELECT 'farms_users',        count(*) FROM orphan_archive.farms_users
UNION ALL SELECT 'initiatives_users',  count(*) FROM orphan_archive.initiatives_users
UNION ALL SELECT 'farms_depots',       count(*) FROM orphan_archive.farms_depots
UNION ALL SELECT 'initiatives_goals',  count(*) FROM orphan_archive.initiatives_goals
UNION ALL SELECT 'users_roles',        count(*) FROM orphan_archive.users_roles
UNION ALL SELECT 'farms_badges',       count(*) FROM orphan_archive.farms_badges
UNION ALL SELECT 'initiatives_badges', count(*) FROM orphan_archive.initiatives_badges
UNION ALL SELECT 'email_messages',     count(*) FROM orphan_archive.email_messages
UNION ALL SELECT 'admins_origins',     count(*) FROM orphan_archive.admins_origins
ORDER BY 1;

-- If the orphans column is all zeros and the archived counts match STEP 1:
COMMIT;
-- Otherwise:
-- ROLLBACK;

-- ============================================================================
-- To restore an archived table if ever needed (example):
--   INSERT INTO farms_depots SELECT * FROM orphan_archive.farms_depots;
-- Once verified in production and no longer needed:
--   DROP SCHEMA orphan_archive CASCADE;
-- ============================================================================
