import { validationResult } from 'express-validator'

import HttpError from '../models/http-error.js'
import User from '../models/user.js'

const getUsers = async(req, res, next) => {
    let users
    try {
        users = await User.find({}, '-password')
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

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password,
        places: [],
    })

    try {
        await createdUser.save()
    } catch (err) {
        const error = new HttpError('Signing up failed2, please try agin', 500)
        return next(error)
    }

    res.status(201).json({ users: createdUser.toObject({ getters: true }) })
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

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid credentials please try again', 401)
        return next(error)
    }

    res.json({
        message: 'Logged in',
        user: existingUser.toObject({ getters: true }),
    })
}

export default { getUsers, signup, login }