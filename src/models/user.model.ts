export class UserModel {
    static async getUsers() {
        return [
            { id: '1', name: 'John Doe', nickname: 'johnny', email: 'john.doe@example.com' },
            { id: '2', name: 'Jane Smith', nickname: 'jane', email: 'jane.smith@example.com' },
            { id: '3', name: 'Bob Johnson', nickname: 'bobby', email: 'bob.johnson@example.com' }
        ]
    }
}
