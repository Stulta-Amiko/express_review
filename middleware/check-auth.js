import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import HttpError from '../models/http-error.js'

dotenv.config()
const JWTKEY = process.env.TOKEN_KEY

const checkAuth = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            throw new Error('Authentication failed')
        }
        const decodedToken = jwt.verify(token, JWTKEY)
        req.userData = { userId: decodedToken.userId }
        next()
    } catch (err) {
        const error = new HttpError('Authentication failed!', 403)
        return next(error)
    }
}

export default checkAuth