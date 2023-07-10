import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import placesRouter from './routes/places-routes.js'
import usersRouter from './routes/users-routes.js'
import HttpError from './models/http-error.js'

dotenv.config()
const app = express()
const dbConnection = process.env.DB_CONNECT

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')

    next()
})

app.use('/api/places', placesRouter)

app.use('/api/users', usersRouter)

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404)
    throw error
})

app.use((err, req, res, next) => {
    if (res.headerSent) {
        return next(err)
    }
    res
        .status(err.code || 500)
        .json({ message: err.message || 'An unknown error occured' })
})

mongoose
    .connect(dbConnection)
    .then(() => {
        app.listen(8000)
    })
    .catch((err) => {
        console.log(err)
    })