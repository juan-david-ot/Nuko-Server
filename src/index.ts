import server from './server.ts'

server.listen(process.env.PORT, () => {
    console.log(`Server listening on ${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT}`}`)
})
