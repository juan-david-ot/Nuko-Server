export class ChatService {
    static async handleMessage(message: { text: string }) {
        // guardar en supabase
        // validar
        return {
            text: message.text
        }
    }
}
