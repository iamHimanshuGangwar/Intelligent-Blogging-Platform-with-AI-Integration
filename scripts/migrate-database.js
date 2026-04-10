#!/bin/env node

/**
 * Apply Supabase migrations programmatically
 * Usage: node scripts/migrate-database.js
 *        node scripts/migrate-database.js --instructions
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const pendingMigrations = [
  '20260329162000_add_post_collaborators.sql',
  '20260329175500_post_collaborators_rls.sql',
];

async function applyMigrations() {
  console.log('Starting Supabase migrations...\n');
  let successCount = 0;
  let failureCount = 0;

  for (const migration of pendingMigrations) {
    try {
      const migrationPath = path.join(__dirname, '../supabase/migrations', migration);
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      console.log('Applying ' + migration + '...');

      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error && error.code !== 'PGRST202') throw error;
      if (!error) {
        console.log('Applied ' + migration + ' via RPC\n');
        successCount++;
      } else {
        throw new Error('exec_sql RPC not available - use --instructions flag');
      }
    } catch (err) {
      console.error('Could not auto-apply ' + migration + ': ' + err.message);
      failureCount++;
    }
  }

  console.log('\nSummary: ' + successCount + ' applied, ' + failureCount + ' need manual run');
  if (failureCount > 0) {
    console.log('Run with --instructions to get the SQL for manual execution.\n');
    process.exit(1);
  }
}

function generateInstructions() {
  const projectRef = 'rxiayejoenqpwfgbydyf';
  console.log('\n========================================');
  console.log(' SUPABASE MIGRATION SQL - RUN IN DASHBOARD');
  console.log('========================================');
  console.log('Dashboard SQL Editor:');
  console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');

  pendingMigrations.forEach((migration, index) => {
    const migrationPath = path.join(__dirname, '../supabase/migrations', migration);
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    console.log('');
    console.log('--- MIGRATION ' + (index + 1) + ': ' + migration + ' ---');
    console.log('');
    console.log(sql);
    console.log('');
    console.log('--- END OF MIGRATION ' + (index + 1) + ' ---');
  });

  console.log('\n========================================');
  console.log('Run both SQL blocks above to enable collaboration features.');
  console.log('========================================\n');
}

if (process.argv.includes('--instructions')) {
  generateInstructions();
} else {
  applyMigrations().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
