import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql'
console.log(`Connecting to database at ${DATABASE_URL}`)
const sql = postgres(DATABASE_URL)

export default sql
