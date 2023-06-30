import express from 'express'
import bodyParser from 'body-parser'

import placesRouter from './routes/places-routes.js'
import usersRouter from './routes/users-routes.js'
import HttpError from './models/http-error.js'

const app = express()

app.use(bodyParser.json())

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

app.listen(8000)