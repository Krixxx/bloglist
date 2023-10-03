var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const totalLikes = blogs.reduce((acc, curr) => {
    return acc + curr.likes
  }, 0)

  return totalLikes === 0 ? 0 : totalLikes
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const mostLikedBlog = blogs.reduce((currentMostLiked, current) => {
    return current.likes > currentMostLiked.likes ? current : currentMostLiked
  }, blogs[0])

  return {
    title: mostLikedBlog.title,
    author: mostLikedBlog.author,
    likes: mostLikedBlog.likes,
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const countByAuthors = _.countBy(blogs, 'author')

  const authorWithMostBlogs = Object.keys(countByAuthors).reduce((a, b) =>
    countByAuthors[b] < countByAuthors[a] ? a : b
  )

  return {
    author: authorWithMostBlogs,
    blogs: countByAuthors[authorWithMostBlogs],
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const groupByAuthors = _.groupBy(blogs, 'author')

  const authorsWithLikes = {}

  for (const author in groupByAuthors) {
    const blogs = groupByAuthors[author]
    const totalLikes = blogs.reduce((sum, blog) => sum + blog.likes, 0)
    authorsWithLikes[author] = totalLikes
  }

  const mostLikedAuthor = Object.keys(authorsWithLikes).reduce((a, b) =>
    authorsWithLikes[b] < authorsWithLikes[a] ? a : b
  )

  return {
    author: mostLikedAuthor,
    likes: authorsWithLikes[mostLikedAuthor],
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
