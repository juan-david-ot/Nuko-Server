import supabase from '../db'

export class UserModel {
    static async getUsers() {
        return await supabase.from('users').select()
    }
}
