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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
