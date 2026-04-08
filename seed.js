const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:-%2F5TT%23W5n6vGqN8@db.khmngyiwusqmqsjkkarm.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase.");

    await client.query(`
      create table if not exists public.tasks (
        id text primary key,
        title text,
        description text,
        assignee text,
        rice text,
        done boolean default false
      );
    `);
    
    // Clear out any old messed up attempts
    await client.query(`TRUNCATE TABLE public.tasks;`);

    await client.query(`
      INSERT INTO public.tasks (id, assignee, title, description, rice, done) VALUES
      ('t1', 'Suraj', 'Check BBA for interest rate clause on buyer defaults', 'Find whether builder charges 18% or 24% on late payments — determines if you get 9% or 18% on refund (doubles recovery)', '760', false),
      ('t2', 'Suraj', 'Organise all payment receipts chronologically', 'List every payment: date, amount, mode, cheque/DD number. From ledger: Rs. 20,02,041 total is confirmed. Verify each.', '2,228', false),
      ('t3', 'Suraj', 'Check UP RERA portal for extension orders on UPRERAPRJ6307', 'Login: surajstoic@gmail.com · If extensions granted, delay compensation period may be reduced', '3,400', false),
      ('t4', 'Suraj', 'Calculate total EMI interest paid to Indiabulls/Sammaan', 'Open the SOA PDFs (both loan accounts). Total the interest column only (not principal). This is your claimable loss.', '1,330', false),
      ('t5', 'Suraj', 'Screenshot all 28 Google reviews (date visible)', 'PDF or print with timestamps visible. Digital screenshots are admissible annexures.', '1,782', false),
      ('t6', 'Suraj', 'Collect rent receipts / proof of alternate accommodation', 'Every month of rent paid during delay = compensation claimable. Collect lease agreements, receipts.', '1,900', false),
      ('t7', 'Suraj', 'Site visit + date-stamped video of construction status', 'Visit Urbainia Trinity NX Greater Noida West. Record video with phone showing date/time. Hard evidence of stall.', '840', false),
      ('t8', 'Suraj', 'File RTI with Greater Noida Authority', 'Request: OC status, building plan sanction date, any notices to builder. RTI fee: Rs. 10', '900', false),
      ('t9', 'Suraj', 'File RTI with UP RERA', 'Request: total complaints filed vs UPRERAPRJ6307, any orders passed, escrow account statement', '1,120', false),
      ('t10', 'Suraj', 'Join Urbainia buyers WhatsApp/Telegram group', '402+ other buyers confirmed by ITAT. Collective complaint = stronger case + shared legal costs', '2,240', false),
      ('l1', 'Lawyer', 'File UP RERA Section 18 Complaint (UPRERAPRJ6307)', 'Primary relief: Full refund + interest OR delay compensation. Include limitation condonation application citing Dec 2025 builder acknowledgment.', '1,125', false),
      ('l2', 'Lawyer', 'Send legal notice to builder — Urbainia CRM (crm@urbainia.in)', 'Trigger 30-day clock. Demand: full account statement, OC status, revised possession date. Creates formal paper trail.', '1,520', false),
      ('l3', 'Lawyer', 'Review BBA: possession date, interest clause, cancellation clause', 'Determine: (a) original contracted possession date, (b) interest rate on buyer defaults, (c) whether BBA has arbitration clause to resist', '760', false),
      ('l4', 'Lawyer', 'File consumer complaint against Sammaan Capital (harassment)', 'Basis: Sep 2024 rape & beating threats by recovery agents (email + PDF documented). Cite SC precedent: CA 6494/2023. Relief: damages + cessation of harassment.', '765', false),
      ('l5', 'Lawyer', 'Advise on strategy: Refund (S.18(1)) vs Accept possession (S.18(2))', 'Key inputs: OC status, BBA interest clause, actual financial loss. Strategy determines which track to lead with.', '500', false),
      ('l6', 'Lawyer', 'Draft full RERA complaint with all annexures', 'Annexures: RERA cert, ledger, payment receipts, IT raid judgment, ITAT 2025, 28 Google reviews, email trail, BBA.', '1,125', false),
      ('l7', 'Lawyer', 'Check MCA portal: Director DIN status', 'Sukhjot Singh Sodhi and Gurmeet Singh — verify if disqualified directors. Disqualification = separate RERA violation.', '1,125', false),
      ('l8', 'Lawyer', 'Send legal notice to Sammaan Capital for EMI interest relief', 'Demand: stoppage/adjustment of EMIs against builders liability. Cite tripartite agreement + Ravi Prakash vs IHFL precedent.', '1,120', false),
      ('l9', 'Lawyer', 'Get RERA extension orders (if any) from UP RERA', 'If extensions were granted without proper grounds, complainant can challenge the extension itself as improper.', '135', false),
      ('l10', 'Lawyer', 'Explore police complaint re: Recovery agent threats', 'IPC 503 (Criminal Intimidation) and 506 (Punishment) — Sep 2024 threats are documented. FIR option available independently.', '47', false);
    `);
    console.log("Successfully seeded 20 tasks.");
  } catch (err) {
    console.error("Database error: ", err);
  } finally {
    await client.end();
  }
}

run();
