import { createServer } from 'node:http'
import app from './app.ts'
import initSocket from './sockets/index.ts'

const server = createServer(app)
initSocket(server)

export default server
