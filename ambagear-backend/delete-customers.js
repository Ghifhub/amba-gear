const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_ANON_KEY is missing in env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteCustomers() {
  console.log('Executing deletion for users with role: customer...');
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('role', 'customer')
    .select();

  if (error) {
    console.error('Error deleting customers:', error);
  } else {
    console.log(`Successfully deleted ${data ? data.length : 0} customer account(s).`);
    if (data && data.length > 0) {
      console.log('Deleted users:', data.map(u => ({ id: u.id, email: u.email, name: u.name })));
    }
  }
}

deleteCustomers();
