import { Server, Socket } from 'socket.io'
import { ChatService } from './chat.service'

function chatSocket(io: Server, socket: Socket) {
    socket.on('disconnect', () => {
        console.log('a user has disconnected', socket.id)
    })

    socket.on('chat message', async (msg) => {
        try {
            console.log('Chat message:', msg)
            const message = await ChatService.handleMessage({ text: msg })
            io.emit('chat message', message.text)
        }
        catch (error) {
            console.error('Error emitting chat message:', error)
        }
    })
}

export default chatSocket
