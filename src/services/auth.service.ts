import bcrypt from 'bcryptjs'

async function hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSalt(10)
    return bcrypt.hash(password, await salt)
}

export default {
    hashPassword
}
