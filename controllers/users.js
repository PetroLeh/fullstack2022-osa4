const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        return response.status(400).json({ error: 'username already taken '})
    } else if (password.length < 6) {
        return response.status(400).json({ error: 'password is too short (must be at least 6 characters)' })
    } else if (username.length < 3) {
        return response.status(400).json({ error: 'username is too short (must be at least 3 characters)' })
    } else if (!password.match(/\d+/)) {
        return response.status(400).json({ error: 'password has to contain a number (0-9)' })
    } else if(!password.match(/[A-Z]+/)) {
        return response.status(400).json({ error: 'password has to contain a capital letter (A-Z)'})
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
        username,
        name,
        passwordHash
    })
    
    response.status(201).json(await user.save())
})

module.exports = usersRouter
