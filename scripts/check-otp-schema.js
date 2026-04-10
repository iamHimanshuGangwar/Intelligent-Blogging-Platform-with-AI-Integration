#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : '';
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const migrations = [
  '20260331200000_otp_auth_complete_schema.sql',
  '20260331210000_fix_otp_codes_unique_email.sql',
];

async function applyViaTables() {
  // Since exec_sql RPC is not available, we apply schema changes
  // by testing if tables exist and creating them via individual operations
  console.log('Checking existing tables...\n');

  // Test if profiles table exists
  const { error: profilesErr } = await supabase.from('profiles').select('id').limit(1);
  if (profilesErr && profilesErr.message.includes('does not exist')) {
    console.log('profiles table does NOT exist - migrations needed');
    console.log('\n=== MANUAL STEP REQUIRED ===');
    console.log('Go to your Supabase Dashboard > SQL Editor');
    console.log('Copy and paste the contents of each migration file:\n');
    for (const m of migrations) {
      console.log(`  supabase/migrations/${m}`);
    }
    console.log('\nOr run this SQL first to enable the apply-migration.js script:');
    console.log('  CREATE OR REPLACE FUNCTION public.exec_sql(sql text)');
    console.log('  RETURNS void LANGUAGE plpgsql SECURITY DEFINER');
    console.log("  AS $$ BEGIN EXECUTE sql; END; $$;");
    return;
  }

  console.log('✓ profiles table exists');

  // Test otp_codes
  const { error: otpErr } = await supabase.from('otp_codes').select('id').limit(1);
  if (otpErr && otpErr.message.includes('does not exist')) {
    console.log('✗ otp_codes table missing - run OTP schema migration');
  } else {
    console.log('✓ otp_codes table exists');
  }

  // Test otp_sessions
  const { error: sessErr } = await supabase.from('otp_sessions').select('id').limit(1);
  if (sessErr && sessErr.message.includes('does not exist')) {
    console.log('✗ otp_sessions table missing - run OTP schema migration');
  } else {
    console.log('✓ otp_sessions table exists');
  }

  // Test user_password_credentials
  const { error: pwdErr } = await supabase.from('user_password_credentials').select('user_id').limit(1);
  if (pwdErr && pwdErr.message.includes('does not exist')) {
    console.log('✗ user_password_credentials table missing - run OTP schema migration');
  } else {
    console.log('✓ user_password_credentials table exists');
  }

  // Test password_reset_tokens
  const { error: resetErr } = await supabase.from('password_reset_tokens').select('id').limit(1);
  if (resetErr && resetErr.message.includes('does not exist')) {
    console.log('✗ password_reset_tokens table missing - run OTP schema migration');
  } else {
    console.log('✓ password_reset_tokens table exists');
  }

  // Test otp_login_audit
  const { error: auditErr } = await supabase.from('otp_login_audit').select('id').limit(1);
  if (auditErr && auditErr.message.includes('does not exist')) {
    console.log('✗ otp_login_audit table missing - run OTP schema migration');
  } else {
    console.log('✓ otp_login_audit table exists');
  }

  // Check if any tables are missing
  const missing = [otpErr, sessErr, pwdErr, resetErr, auditErr].filter(
    e => e && e.message.includes('does not exist')
  );

  if (missing.length > 0) {
    console.log(`\n${missing.length} table(s) missing. Apply migrations via Supabase SQL Editor:`);
    for (const m of migrations) {
      const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', m);
      console.log(`\n--- ${m} ---`);
      console.log(fs.readFileSync(sqlPath, 'utf8'));
    }
  } else {
    console.log('\n✓ All OTP auth tables are present!');
  }
}

applyViaTables().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
