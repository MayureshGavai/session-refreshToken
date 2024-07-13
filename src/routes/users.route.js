import express from 'express'
import { signinController, signoutController, signupController } from '../controllers/user.controller.js'

const router = express.Router()

router.post('/signin',signinController)
router.post('/signup',signupController)
router.get('/signout',signoutController)

export default router