const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})
  
blogsRouter.post('/', async (request, response) => {
  const blog = request.body.likes
    ? new Blog(request.body)
    : new Blog({...request.body, likes: 0})

  const result = await blog.save()
  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blogToRemove = await Blog.findByIdAndRemove(request.params.id)

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = {...request.body}  
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.status(201).json(updatedBlog)  
})

module.exports = blogsRouter