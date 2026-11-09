import { CoreModel } from '../models/index.ts'

async function isUserInCore(userId: string, coreId: string): Promise<boolean> {
    const coresResponse = await CoreModel.getCoresByUserId(userId)

    if (coresResponse.error) {
        throw coresResponse.error
    }

    return coresResponse.data?.some((core) => core.id === coreId) ?? false
}

export default {
    isUserInCore
}
