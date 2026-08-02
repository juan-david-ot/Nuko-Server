import { createServer } from 'node:http'
import app from './app.ts'
import initSocket from './sockets/index.ts'

const server = createServer(app)
initSocket(server)

server.listen(process.env.PORT, () => {
    console.log(`Server listening on http://localhost:${process.env.PORT}`)
})
