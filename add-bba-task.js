const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:-%2F5TT%23W5n6vGqN8@db.khmngyiwusqmqsjkkarm.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase.");

    // Insert the BBA task — highest priority, placed first with id 't0'
    // Use ON CONFLICT DO NOTHING so re-running is safe
    await client.query(`
      INSERT INTO public.tasks (id, assignee, title, description, rice, done)
      VALUES (
        't0',
        'Suraj',
        'URGENT: Request BBA soft copy from builder to establish interest rate',
        'Email crm@urbainia.in immediately: "Please provide soft copy of Builder Buyer Agreement (BBA) / Quadripartite Agreement for Flat D-408, Urbainia Trinity NX Phase-III." — The BBA interest rate clause determines whether delay compensation is 9% (RERA S.18) or 18% (SC precedent CA 6494/2023). Without it, the court cannot confirm the higher rate. Potential difference: ₹34.5L (9%) vs ₹44.4L (18%).',
        '9,500',
        false
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("Task t0 inserted (or already exists — skipped).");
  } catch (err) {
    console.error("Database error: ", err);
  } finally {
    await client.end();
  }
}

run();
