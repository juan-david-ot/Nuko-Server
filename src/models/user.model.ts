import { PostgrestSingleResponse } from '@supabase/supabase-js'
import supabase from '../db'
import { PartialUser, User } from '../definitions/types'

async function getUser(searchUser: PartialUser): Promise<PostgrestSingleResponse<User>> {
    let query = supabase.from('users').select()
    if (searchUser.id) {
        query = query.eq('id', searchUser.id)
    }
    if (searchUser.email) {
        query = query.eq('email', searchUser.email)
    }
    if (searchUser.username) {
        query = query.eq('username', searchUser.username)
    }
    if (searchUser.name) {
        query = query.eq('name', searchUser.name)
    }
    if (searchUser.surname) {
        query = query.eq('surname', searchUser.surname)
    }
    return query.limit(1).single()
}

async function getUsers(searchUser: PartialUser): Promise<PostgrestSingleResponse<User[]>> {
    let query = supabase.from('users').select()
    if (searchUser.id) {
        query = query.eq('id', searchUser.id)
    }
    if (searchUser.email) {
        query = query.eq('email', searchUser.email)
    }
    if (searchUser.username) {
        query = query.eq('username', searchUser.username)
    }
    if (searchUser.name) {
        query = query.eq('name', searchUser.name)
    }
    if (searchUser.surname) {
        query = query.eq('surname', searchUser.surname)
    }
    return query
}

async function saveUser(newUser: User): Promise<PostgrestSingleResponse<User>> {
    return supabase.from('users').insert(newUser).select().limit(1).single()
}

export default {
    getUser,
    getUsers,
    saveUser
}
