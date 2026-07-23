import 'dotenv/config'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL || 'database_url'

const pg = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
})

const result = await pg.query('SELECT current_database() AS database')
console.log(`Connected to PostgreSQL! Database: '${result.rows[0].database}'`)

export default pg
