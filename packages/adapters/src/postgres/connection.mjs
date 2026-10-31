import pg from 'pg';
export async function connect(){
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL_REQUIRED');
  const client=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000,statement_timeout:10000});
  await client.connect();return client;
}
