const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:-%2F5TT%23W5n6vGqN8@db.khmngyiwusqmqsjkkarm.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.apple_tasks (
        id text PRIMARY KEY,
        title text,
        description text,
        assignee text,
        rice text,
        done boolean DEFAULT false
      );
    `);

    await client.query(`TRUNCATE TABLE public.apple_tasks;`);

    await client.query(`
      INSERT INTO public.apple_tasks (id, assignee, title, description, rice, done) VALUES
      ('a1', 'Suraj', 'Discuss 4 legal notice review points with lawyer', 'Review Legal_Notice_Review_Points.docx on Desktop with Adv. Sudhanshu Kr. Singh before notice is served', '2400', false),
      ('a2', 'Suraj', 'Collect F1 Info job sheets / repair receipts (all 3 visits)', 'CRITICAL: Request physical repair receipts from F1 Info for 19 Feb, 21 Feb, and 25 Feb visits. These are primary service centre records.', '3200', false),
      ('a3', 'Suraj', 'Collect Apple Diagnostics printout from F1 Info', 'CRITICAL: Request the formal Apple Diagnostics report they would have run. This is an official Apple-generated document.', '2800', false),
      ('a4', 'Suraj', 'Add call recordings to Evidence_Package/08_Call_Recordings/', 'Any recorded phone calls with Apple Support agents (Mohammed, Kritika, Danish) to be added', '1800', false),
      ('a5', 'Suraj', 'Screenshot Amazon Help DM reply when received', 'Save Amazon Help DM response to Evidence_Package/07_Email_Correspondence/Amazon_Twitter_DM/', '1200', false),
      ('a6', 'Suraj', 'Collect EMI bank statements showing 6 deductions', 'Bank account statements showing EMI deductions of Rs.14,165 each — proves ongoing financial loss from defective device', '1600', false),
      ('a7', 'Suraj', 'Upload Evidence_Package to Google Drive', 'rclone installed, gdrive remote configured. Complete OAuth token and run: rclone copy Evidence_Package gdrive:Apple_Case/', '900', false),
      ('a8', 'Suraj', 'File consumer complaint at District Forum, Patna', 'After lawyer finalises the complaint draft — file at District Consumer Disputes Redressal Commission, Patna', '2000', false),
      ('l1', 'Lawyer', 'Finalize and send legal notice to Apple India + F1 Info', 'Review 4 identified issues, make corrections, send via courier with tracking. 15-day response window starts from delivery.', '3600', false),
      ('l2', 'Lawyer', 'Draft consumer complaint under CPA 2019', 'Forum: District Consumer Commission, Patna. Relief: Replacement OR refund Rs.81,160 + 18% interest + Rs.25,000 mental agony + costs', '2800', false),
      ('l3', 'Lawyer', 'Consider adding Amazon/Clicktech Retail as 3rd Respondent', 'Clicktech Retail Pvt. Ltd. (Amazon seller) is jointly liable as seller. Add if Amazon deflects on their DM response.', '1400', false),
      ('l4', 'Lawyer', 'Prepare technical summary of crash logs for forum', 'Translate IPS crash log technical terms (TH_UNINT, GPU/MMU/TLB faults, watchdog) into plain language for the forum judge', '2000', false),
      ('l5', 'Lawyer', 'Source Apple India precedents from NCDRC/District Forums', 'Search for past consumer forum orders against Apple India involving MacBook defects, replacement refused, premature case closure', '1200', false);
    `);

    console.log('Successfully seeded 13 Apple case tasks.');
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
  }
}

run();
