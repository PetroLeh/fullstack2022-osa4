const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.listWithManyBlogs)
})

test('blogs are returned as json', async () => {
    await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.listWithManyBlogs.length)
})

test('identifying field is \'id\'', async () => {
    const response = await api.get('/api/blogs')

    const first = response.body[0]
    expect(first.id).toBeDefined()
})

test('a new blog can be added', async () => {
    const newBlog = 
    {
        _id: "5a422a851b54a676234d17f6",
        title: "New Kids on the Blog",
        author: "New Kids",
        url: "https://www.google.com/",
        likes: 0,
        __v: 0
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.listWithManyBlogs.length + 1)

    const ids = response.body.map(blog => blog.id)
    expect(ids).toContain('5a422a851b54a676234d17f6')
})

test('\'likes\' is set to zero if no value is given', async () => {
    const newBlog = 
    {
        _id: "5a422a851b54a676234d17f6",
        title: "New Kids on the Blog",
        author: "New Kids",
        url: "https://www.google.com/",
        __v: 0
    }
    
    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const blog = response.body.find(blog => blog.id === '5a422a851b54a676234d17f6')

    expect(blog.likes).toBeDefined()
    expect(blog.likes).toBe(0)
})

test('a new blog has to have a title', async () => {
    const newBlog = 
    {
        _id: "5a422a851b54a676234d17f6",
        title : "",
        author: "New Kids",
        url: "https://www.google.com/",
        __v: 0
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a new blog has to have an url', async () => {
    const newBlog = 
    {
        _id: "5a422a851b54a676234d17f6",
        title : "New Kids on the Blog",
        author: "New Kids",
        url: "",
        __v: 0
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

afterAll(() => {
    mongoose.connection.close()
})