import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import HttpError from '../models/http-error.js'
import User from '../models/user.js'

dotenv.config()
const JWTKEY = process.env.TOKEN_KEY

const getUsers = async(req, res, next) => {
    let users
    try {
        users = await User.find({}, '-password') //비밀번호 빼고전송
    } catch (err) {
        const error = new HttpError('Fetching users failed, Please try again later')
        return next(error)
    }
    res.json({ users: users.map((user) => user.toObject({ getters: true })) })
}

const signup = async(req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
        const error = new HttpError(
            'Invalid inputs passed please check your data',
            422
        )
        return next(error)
    }
    const { name, email, password } = req.body

    let existingUser

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Singing up failed please try again later', 500)
        return next(error)
    }

    if (existingUser) {
        const error = new HttpError(
            'User exists already, please login instead',
            422
        )
        return next(error)
    }

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (err) {
        const error = new HttpError('Could not create user, please try again', 500)
        return next(error)
    }

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: [],
    })

    try {
        await createdUser.save()
    } catch (err) {
        const error = new HttpError('Signing up failed2, please try agin', 500)
        return next(error)
    }

    let token
    try {
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email },
            JWTKEY, { expiresIn: '1h' }
        )
    } catch (err) {
        const error = new HttpError('Signing up failed2, please try agin', 500)
        return next(error)
    }

    res
        .status(201)
        .json({ userId: createdUser.id, email: createdUser.email, token: token })
}

const login = async(req, res, next) => {
    const { email, password } = req.body

    let existingUser

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Log in failed please try again later', 500)
        return next(error)
    }

    if (!existingUser) {
        const error = new HttpError('Invalid credentials please try again', 403)
        return next(error)
    }

    let isValidPassword = false
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch (err) {
        const error = new HttpError(
            'Could not log you in please check your credentials and try again',
            500
        )
        return next(error)
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials please try again', 403)
        return next(error)
    }

    let token
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email },
            JWTKEY, { expiresIn: '1h' }
        )
    } catch (err) {
        const error = new HttpError('Log in failed2, please try agin', 500)
        return next(error)
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token,
    })
}

export default { getUsers, signup, login }