import 'dotenv/config';
import { supabase } from './src/supabase';

async function test() {
  console.log('Fetching OpenAPI schema from PostgREST...');
  const url = `${process.env.SUPABASE_URL}/rest/v1/`;
  const response = await fetch(url, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
    }
  });
  if (!response.ok) {
    console.error('Failed to fetch schema:', response.status, await response.text());
    return;
  }
  const spec = await response.json() as any;
  console.log('Tables/Views found:');
  console.log(Object.keys(spec.paths || {}).filter(path => !path.startsWith('/rpc/')));
  console.log('RPC Functions found:');
  console.log(Object.keys(spec.paths || {}).filter(path => path.startsWith('/rpc/')));
}

test();
