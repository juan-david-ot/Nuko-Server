import supabase from '../db'
import { PartialUser, User } from '../definitions/types'

async function getUsers(searchUser: PartialUser) {
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

async function saveUser(newUser: User) {
    return supabase.from('users').insert(newUser).select()
}

export {
    getUsers,
    saveUser
}
