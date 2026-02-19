import express, { Express } from 'express'

export default (app: Express) => {
	app.use(express.json())
}
