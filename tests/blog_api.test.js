const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

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

test('blog without likes property is added  with default value of 0', async () => {
  const newBlog = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
  }

  expect(newBlog.likes).toBeUndefined()

  const response = await api.post('/api/blogs').send(newBlog).expect(201)

  expect(response.body.likes).toBe(0)
})

afterAll(async () => {
  await mongoose.connection.close()
})
