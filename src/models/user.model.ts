import supabase from '../db'

class UserModel {
    static async getUsers() {
        return await supabase.from('users').select()
    }
}

export default UserModel
