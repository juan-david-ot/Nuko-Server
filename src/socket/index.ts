import { Server as IOServer, Socket } from 'socket.io'
import type { Server as HTTPServer } from 'node:http'
import chatSocket from './chat/chat.socket'

function initSocket(server: HTTPServer) {
    const io = new IOServer(server, {
        cors: {
            origin: process.env.ORIGIN // Poner IP del ordenador para probar en dispositivos
        }
    })

    io.on('connection', (socket: Socket) => {
        console.log('A NEW USER HAS CONNECTED', socket.id)

        chatSocket(io, socket)
    })

    return io
}

export default initSocket
