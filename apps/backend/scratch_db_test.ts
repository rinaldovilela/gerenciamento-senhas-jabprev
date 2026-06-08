import 'dotenv/config';
import { supabase } from './src/supabase';

async function test() {
  console.log('Testing user update...');
  const { data: users, error: fetchErr } = await supabase.from('users').select('*').limit(1);
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }
  if (!users || users.length === 0) {
    console.log('No users found.');
    return;
  }
  const user = users[0];
  console.log('Found user:', user.email, 'ID:', user.id);
  console.log('Attempting to update avatar_url...');
  const { error: updateErr } = await supabase
    .from('users')
    .update({ avatar_url: 'https://example.com/test.png' })
    .eq('id', user.id);
  
  if (updateErr) {
    console.error('Update error:', updateErr);
  } else {
    console.log('Update successful! avatar_url column exists and works.');
  }
}

test();
