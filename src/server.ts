import { createServer } from 'node:http'
import app from './app'
import { Server } from 'socket.io'

const PORT = process.env.PORT || 2608

const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.ORIGIN || 'http://localhost:2409'
    }
})

io.on('connection', (socket) => {
    console.log('A NEW USER HAS CONNECTED')

    socket.on('disconnect', () => {
        console.log('a user has disconnected')
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg)
    })
})

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
