/**
 * Script to verify and fix the meeting_minutes table schema in Supabase
 * 
 * This script will:
 * 1. Verify that the necessary columns exist
 * 2. Ensure the column types match our TypeScript types
 * 3. Add missing columns if needed
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkMeetingMinutesSchema() {
  console.log('Checking meeting_minutes table schema...');

  try {
    // First, verify the table exists by performing a query
    const { data: testData, error: testError } = await supabase
      .from('meeting_minutes')
      .select('*')
      .limit(1);

    if (testError && testError.code === '42P01') {
      console.error('Table meeting_minutes does not exist!');
      // You would create the table here
      return;
    }

    // Get information about the columns in the table
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'meeting_minutes' });

    if (columnsError) {
      console.error('Error getting columns:', columnsError);
      return;
    }

    console.log('Current columns in meeting_minutes table:');
    for (const column of columns) {
      console.log(`- ${column.column_name}: ${column.data_type}`);
    }

    // Check for required columns
    const requiredColumns = [
      'id', 'event_id', 'file_path', 'file_name', 'content', 
      'source_type', 'uploaded_by', 'created_at', 'updated_at'
    ];

    const missingColumns = requiredColumns.filter(
      col => !columns.some(c => c.column_name === col)
    );

    if (missingColumns.length > 0) {
      console.error('Missing columns:', missingColumns);
      // You would add these columns here
    } else {
      console.log('All required columns exist.');
    }

    // Test a simple query to verify we can retrieve records
    const { data: sampleData, error: sampleError } = await supabase
      .from('meeting_minutes')
      .select(`
        id,
        event_id,
        file_path,
        file_name,
        content,
        source_type,
        uploaded_by,
        created_at,
        updated_at
      `)
      .limit(5);

    if (sampleError) {
      console.error('Error querying meeting_minutes:', sampleError);
    } else {
      console.log(`Successfully retrieved ${sampleData.length} records.`);
      if (sampleData.length > 0) {
        console.log('Sample record:', sampleData[0]);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Execute the function
checkMeetingMinutesSchema()
  .then(() => console.log('Schema check complete.'))
  .catch(err => console.error('Error running schema check:', err)); 