const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    if (blogs.length === 0) {
        return 0
    } else if (blogs.length === 1) {
        return blogs[0].likes
    } else {
        return blogs.map(b => b.likes).reduce((sum, val) => sum + val)
    }
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    } else if (blogs.length === 1) {
        const blog = blogs[0]
        return {
            title: blog.title,
            author: blog.author,
            likes: blog.likes
        }
    } else {
        const blog = blogs.sort((b1, b2) => b2.likes - b1.likes)[0]
        return {
            title: blog.title,
            author: blog.author,
            likes: blog.likes
        }
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}

