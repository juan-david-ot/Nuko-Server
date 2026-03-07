import supabase from '../db'
import { User } from '../definitions/types'

class UserModel {
    static async getUsers() {
        return supabase.from('users').select()
    }

    static async saveUser(newUser: User) {
        return supabase.from('users').insert({ newUser }).select()
    }
}

export default UserModel
