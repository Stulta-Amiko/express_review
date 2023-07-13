import express from 'express'
import { check } from 'express-validator'

import usersController from '../controllers/users-controller.js'
import fileUpload from '../middleware/file-upload.js'

const router = express.Router()

router.get('/', usersController.getUsers)

router.post(
    '/signup',
    fileUpload.single('image'), [
        check('email').normalizeEmail().isEmail(),
        check('name').not().isEmpty(),
        check('password').isLength({ min: 6 }),
    ],
    usersController.signup
)

router.post('/login', usersController.login)

export default router