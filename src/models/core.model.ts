import { UUID } from 'node:crypto'
import { Core, PartialCore } from '../definitions/types'
import supabase from '../db'

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

async function getCoresByUserId(userId: string) {
    return supabase.from('cores_users').select('cores(*)').eq('user_id', userId)
}

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

async function saveCore(newCore: Core) {
    return supabase.from('cores').insert({ name: newCore.name, creator_id: newCore.creatorId }).select().limit(1).single()
}

async function addUserToCore(coreId: UUID, userId: UUID) {
    return supabase.from('cores_users').insert({ core_id: coreId, user_id: userId }).select().limit(1).single()
}

export {
    getCores,
    getCoresByUserId,
    getCore,
    saveCore,
    addUserToCore
}
