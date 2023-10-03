const listHelper = require('../utils/list_helper')

test('dummy returns 1', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list as zero', () => {
    const blogs = []

    const likesCount = listHelper.totalLikes(blogs)
    expect(likesCount).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const blogs = [{ title: 'Test Blog', likes: 5 }]

    const likesCount = listHelper.totalLikes(blogs)
    expect(likesCount).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = [
      { title: 'Test Blog One', likes: 5 },
      { title: 'Test Blog Two', likes: 4 },
      { title: 'Test Blog Three', likes: 16 },
      { title: 'Test Blog Four', likes: 23 },
      { title: 'Test Blog Five', likes: 1 },
      { title: 'Test Blog Six', likes: 9 },
    ]

    const likesCount = listHelper.totalLikes(blogs)
    expect(likesCount).toBe(58)
  })
})
