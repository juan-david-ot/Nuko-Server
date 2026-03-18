import supabase from '../db'
import { Core } from '../definitions/types'

async function getCores() {
    return supabase.from('cores').select()
}

async function saveCore(newCore: Core) {
    return supabase.from('cores').insert(newCore).select()
}

export default {
    getCores,
    saveCore
}
