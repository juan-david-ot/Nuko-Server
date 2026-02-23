import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'supabase_url'
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'supabase_key'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default supabase
