const _ = require("lodash")

const dummy = (blogs) => {
    return 1
}
  
const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item
    }
    const blogLikes = blogs.map(blog => blog.likes)
    return blogLikes.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const blogLikes = blogs.map(blog => blog.likes)
    theFavoriteBlog = blogs[blogLikes.indexOf(Math.max(...blogLikes))]
    return {
        title: theFavoriteBlog.title,
        author: theFavoriteBlog.author,
        likes: theFavoriteBlog.likes
    }
}

const mostBlogs = (blogs) => {
    const listOfAuthors = blogs.map(blog => blog.author)
    const countOfAuthors = _.countBy(listOfAuthors)
    const mostAuthor = _.maxBy(Object.keys(countOfAuthors), o => countOfAuthors[o])
    return {
        author: mostAuthor,
        blogs: countOfAuthors[mostAuthor]
    }
}

const mostLikes = (blogs) => {
    let listOfLikes = {}
    for (const i in blogs) {
        if (listOfLikes[blogs[i].author]) {
            listOfLikes[blogs[i].author] += blogs[i].likes
        } else {
            listOfLikes[blogs[i].author] = blogs[i].likes
        }
    }
    const mostLikedAuthor = _.maxBy(Object.keys(listOfLikes), o => listOfLikes[o])
    return {
        author: mostLikedAuthor,
        likes: listOfLikes[mostLikedAuthor]
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}