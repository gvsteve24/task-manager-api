const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const cors = require('cors')
const corsOptions = {
    allowedHeaders: 'content-Type, Authorization',
    maxAge: 600,
    preflightContinue: true
}

// router.use('/users/login', async (req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*')
//     res.header('Access-Control-Allow-Header', 'content-type')
//     res.header('Access-Control-Allow-Header', 'Authorization')

//     next()
// })
router.use(cors())
router.post('/users/register', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save()
        const token = await user.generateAuthToken() 
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }

})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token  = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.post('/users/logout', auth, async (req, res) => {
    const user = req.user
    const newToken = req.token
    try {

        user.tokens = user.tokens.filter((token) => {
            return token.token !== newToken
        })
        
        await req.user.save()
        res.send(req.user)
        
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) =>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()        
    } catch (e) {
        res.status(500).send()
    }
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['age', 'name', 'email', 'password']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Update' })
    }
    try {
        const user = req.user

        updates.forEach((update) => user[update] = req.body[update])

        await user.save()
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router