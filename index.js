const { PORT, mongoUrl} = require('./utils/config')
const logger = require('./utils/logger')
const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Blog = require('./models/blog')
const blogsRouter = require('./controllers/blogs')

mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})