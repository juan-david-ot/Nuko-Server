import { Pool } from 'pg'

const pg = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
})

const { rows: [connection] } = await pg.query('SELECT current_database() AS database')
console.log(`Connected to PostgreSQL! Database: '${connection.database}'`)

export default pg
