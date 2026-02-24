import { createServer } from 'node:http'
import app from './app'
import initSocket from './sockets'

const PORT = process.env.PORT || 2608

const server = createServer(app)
initSocket(server)

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
