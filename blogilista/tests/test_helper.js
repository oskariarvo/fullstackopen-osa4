const Blog = require("../models/blog")
const User = require("../models/user")
const bcrypt = require("bcryptjs")

const initialBlogs = [
    {
      // _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7
      // __v: 0
    },
    {
      // _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5
      // __v: 0
    },
    {
      // _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12
      // __v: 0
    },
    {
      // _id: "5a422b891b54a676234d17fa",
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10
      // __v: 0
    },
    {
      // _id: "5a422ba71b54a676234d17fb",
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0
      // __v: 0
    },
    {
      // _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2
      //__v: 0
    }  
  ]

const initialUsers = [
    {
      username: "bling_blong",
      passwordHash: "thispasswordissecure",
      name: "Patrick Jones"
    },
    {
      username: "ding_dong",
      passwordHash: "thispasswordisreallysecure",
      name: "Jack West"
    }
  ]

const nonExistingId = async () => {
    const blog = new Blog({title: "willRemoveThis", author: "thomas jones", url: "https://something.html"})
    //console.log("nonExistingId before id", blog)
    await blog.save()
    await blog.deleteOne()
    //console.log("nonExistingId after id", blog._id.toString())
    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    const afterToJSON = blogs.map(blog => blog.toJSON())
    return afterToJSON
}

const usersInDb = async () => {
    const users = await User.find({})
    const afterToJSON = users.map(user => user.toJSON())
    return afterToJSON
}

const initialLogin = async () => {
  const initial = initialUsers

  saltRounds = 10
  for (let u of initial) {
    let newPasswordHash = await bcrypt.hash(u.passwordHash, saltRounds)
    u.passwordHash = newPasswordHash
    //console.log(u.passwordHash)
  }
  return initial
}

const loginUsersInDb = async () => {
  const users = await User.find({})
  const afterToJSON = users.map(user => user.toJSON())
  return afterToJSON

    //console.log("password:", passwordHash)
}

module.exports = {initialBlogs, nonExistingId, blogsInDb, initialUsers, usersInDb, initialLogin, loginUsersInDb}