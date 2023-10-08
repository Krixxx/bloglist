const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there are some initial blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('correct amount of blog posts returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('verify that unique property of the blog post is named id', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach((element) => {
      expect(element.id).toBeDefined()
    })
  })
})

describe('creating new blog', () => {
  test('a valid blog post can be added', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterAdding = await helper.blogsInDb()
    expect(blogsAfterAdding).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAfterAdding.map((blog) => blog.title)
    expect(titles).toContain('Canonical string reduction')
  })

  test('blog without likes property is added with default value of 0', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    }

    expect(newBlog.likes).toBeUndefined()

    const response = await api.post('/api/blogs').send(newBlog).expect(201)

    expect(response.body.likes).toBe(0)
  })

  test('blog without title is not added and get back 400 response', async () => {
    const newBlog = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
      likes: 10,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const blogsAfterSaving = await helper.blogsInDb()

    expect(blogsAfterSaving).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without url is not added and get back 400 response', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      likes: 10,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const blogsAfterSaving = await helper.blogsInDb()

    expect(blogsAfterSaving).toHaveLength(helper.initialBlogs.length)
  })
})

describe('editing a blog', () => {
  test('update count of likes of an existing blog', async () => {
    const blogsAtBeginning = await helper.blogsInDb()
    let blogToEdit = blogsAtBeginning[0]
    blogToEdit.likes = blogToEdit.likes + 3

    const response = await api
      .put(`/api/blogs/${blogToEdit.id}`)
      .send(blogToEdit)
      .expect(200)

    expect(response.body.likes).toBe(blogToEdit.likes)
  })
})

describe('deletion of a blog', () => {
  test('delete a note and succeed with status code 204 if id is valid', async () => {
    const blogsAtBeginning = await helper.blogsInDb()
    const blogToDelete = blogsAtBeginning[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAfterDelete = await helper.blogsInDb()

    expect(blogsAfterDelete).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAfterDelete.map((blog) => blog.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Test',
      password: 'salasala',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('create user with username less that three characters and return 400 statuscode', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ro',
      name: 'Test',
      password: 'salasala',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain(
      'shorter than the minimum allowed length (3)'
    )

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('create user with password less that three characters and return 400 statuscode', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'test',
      name: 'Test',
      password: 'sa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain(
      'password must be at least 3 characters long'
    )

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('create user with no password and return 400 statuscode', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'test',
      name: 'Test',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password is required')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
