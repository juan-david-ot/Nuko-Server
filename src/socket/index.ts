import { Server as IOServer, Socket } from 'socket.io'
import type { Server as HTTPServer } from 'node:http'

export function initSocket(server: HTTPServer) {
    const io = new IOServer(server, {
        cors: {
            origin: process.env.ORIGIN
        }
    })

    io.on('connection', (socket: Socket) => {
        console.log('A NEW USER HAS CONNECTED')

        socket.on('disconnect', () => {
            console.log('a user has disconnected')
        })

        socket.on('chat message', (msg) => {
            io.emit('chat message', msg)
        })
    })

    return io
}
