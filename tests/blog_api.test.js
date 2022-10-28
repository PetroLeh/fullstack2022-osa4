const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

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


describe('when a user is logged in', () => {
    beforeEach(async () => {
        const testUser = {
            username: "tester",
            name: "tester",
            password: "Tester2"
        }
        await api.post('/api/users').send(testUser)
        api.post('/api/login').send({ username: "tester", password: "Tester2"})
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

    test('a blog can be removed', async () => {
        const blogsAtStart = await helper.blogsInDB()
        const blogToRemove = blogsAtStart[0]
        
        await api
            .delete(`/api/blogs/${blogToRemove.id}`)
            .expect(204)
        
        const blogsAtEnd = await helper.blogsInDB()
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
        expect(blogsAtEnd).not.toContainEqual(blogToRemove)
    })
    
    test('a blog can be updated', async () => {
        const blogsAtStart = await helper.blogsInDB()
        const blogToUpdate = blogsAtStart[0]
     
        const updatedBlog = {...blogToUpdate, likes: blogToUpdate.likes + 1}
        
        const response = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(201)
    
        const receivedBlog = response.body
        expect(receivedBlog.likes).toBe(blogToUpdate.likes + 1)    
    })
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('alainen', 10)
        const user = new User({
            username: 'firstUser',
            passwordHash
        })
        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Ttulppu',
            name: 'Teppo Tulppu',
            password: 'Naapuri2'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(user => user.username)
        expect(usernames).toContainEqual(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'firstUser',
            name: 'Last User Standing',
            password: 'Alainen2'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('username already taken')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })    
})

describe('user is not created if', () => {
    test('password is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            userName: 'ThisIsValid',
            name: 'This Is Valid Too',
            password: 'no'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        expect(result.body.error).toContain('password is too short')
        
        const UsersAtEnd = await helper.usersInDb()
        expect(UsersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('password does not contain a number', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'ThisIsValid',
            name: 'This Is Valid Too',
            password: 'This is not valid'
        }

        const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('password has to contain a number') 

        const UsersAtEnd = await helper.usersInDb()
        expect(UsersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('password does not contain a capital letter', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'ThisIsValid',
            name: 'This Is Valid Too',
            password: 'this is not valid2'
        }

        const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('password has to contain a capital letter') 

        const UsersAtEnd = await helper.usersInDb()
        expect(UsersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('username is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'no',
            name: 'This Is Valid',
            password: 'ThisIsValid2'
        }

        const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('username is too short') 

        const UsersAtEnd = await helper.usersInDb()
        expect(UsersAtEnd).toHaveLength(usersAtStart.length)            
    })
})

afterAll(() => {
    mongoose.connection.close()
})