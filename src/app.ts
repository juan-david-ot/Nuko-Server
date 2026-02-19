import express from 'express'

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
	console.log('Hello World!!')
	res.send('Hello World!!')
})

export default app
