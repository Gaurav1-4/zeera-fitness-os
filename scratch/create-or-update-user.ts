import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const email = 'gauravgoyal2112007@gmail.com';
  const password = 'Password123!';
  
  console.log(`Checking/Creating user: ${email}...`);
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    console.log(`Found existing user with ID: ${existingUser.id}`);
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: password, email_confirm: true }
    );
    if (error) {
      console.error("Error updating user password:", error);
    } else {
      console.log(`Successfully updated password for ${email} to ${password}`);
    }
  } else {
    console.log(`User ${email} not found. Creating user...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) {
      console.error("Error creating user:", error);
    } else {
      console.log(`Successfully created user ${email} with password ${password}`);
    }
  }
}

run().catch(console.error);
