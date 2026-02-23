import sql from '../db'

export class UserModel {
    static async getUsers() {
        return await sql`SELECT * FROM users`
    }
}
