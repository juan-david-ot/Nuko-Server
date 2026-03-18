import { UUID } from 'node:crypto'
import supabase from '../db'

async function saveCoreUser(coreId: UUID, userId: UUID) {
    return supabase.from('cores_users').insert({ core_id: coreId, user_id: userId }).select().limit(1).single()
}

export default {
    saveCoreUser
}
