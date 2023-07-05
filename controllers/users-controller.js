import { v4 as uuid } from 'uuid'
import { validationResult } from 'express-validator'

import HttpError from '../models/http-error.js'
import User from '../models/user.js'

const DUMMY_USERS = [{
    id: 'u1',
    name: 'user1 name',
    email: 'test@email.com',
    password: 'testpw',
}, ]
const getUsers = (req, res, next) => {
    res.status(200).json({ users: DUMMY_USERS })
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
    const { name, email, password, places } = req.body

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
        image: 'https://codechacha.com/static/653ef1438ef7c8ed7104a02a0583f949/8c76f/ko-653ef143.png',
        password,
        places,
    })

    try {
        await createdUser.save()
    } catch (err) {
        const error = new HttpError('Signing up failed, please try agin', 500)
        return next(error)
    }

    res.status(201).json({ users: createdUser.toObject({ getters: true }) })
}

const login = (req, res, next) => {
    const { email, password } = req.body

    const identifiedUser = DUMMY_USERS.find((u) => u.email === email)
    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError(
            'Could not identify user, credentials seem to be wrong',
            401
        )
    }

    res.json({ message: 'Logged in' })
}

export default { getUsers, signup, login }