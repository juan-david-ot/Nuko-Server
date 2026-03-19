import { UUID } from 'node:crypto'
import supabase from '../db'
import { Core, PartialCore } from '../definitions/types'

async function getCore(searchCore: PartialCore) {
    let query = supabase.from('cores').select()
    if (searchCore.id) {
        query = query.eq('id', searchCore.id)
    }
    if (searchCore.name) {
        query = query.eq('name', searchCore.name)
    }
    if (searchCore.creatorId) {
        query = query.eq('creator_id', searchCore.creatorId)
    }
    return query.limit(1).single()
}

async function getCores(searchCore: PartialCore) {
    let query = supabase.from('cores').select()
    if (searchCore.id) {
        query = query.eq('id', searchCore.id)
    }
    if (searchCore.name) {
        query = query.eq('name', searchCore.name)
    }
    if (searchCore.creatorId) {
        query = query.eq('creator_id', searchCore.creatorId)
    }
    return query
}

async function saveCore(newCore: Core) {
    return supabase.from('cores').insert({ name: newCore.name, creator_id: newCore.creatorId }).select().limit(1).single()
}

async function addUserToCore(coreId: UUID, userId: UUID) {
    return supabase.from('cores_users').insert({ core_id: coreId, user_id: userId }).select().limit(1).single()
}

export default {
    getCore,
    getCores,
    saveCore,
    addUserToCore
}
