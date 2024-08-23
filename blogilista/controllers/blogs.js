const blogsRouter = require("express").Router()
const Blog = require("../models/blog")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const userExtractor = require("../utils/middleware").userExtractor

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {username: 1, name: 1, id: 1})
  response.json(blogs)
  })

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const user = request.user

  const newBlog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: user._id
  })
  const savedBlog = await newBlog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete("/:id", userExtractor, async (req, res, next) => {
  const user = req.user
  userJSON = user.toJSON()
  const userBlogIds = userJSON.blogs.map(blog => blog.toJSON())

  if (userBlogIds.includes(req.params.id)) {
    await Blog.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } else {
    return res.status(404).json({error: "Blog not found"})
  }
  })

blogsRouter.put("/:id", async (req, res, next) => {
  const newBlog = {
    title: req.body.title,
    author: req.body.author,
    url: req.body.url,
    likes: req.body.likes
  }
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, newBlog, {new: true, runValidators: true, context: "query"})
  if (!updatedBlog) {
    res.status(400).json({error: error.message})
  } else {
    res.status(200).json(updatedBlog)
  }
})

module.exports = blogsRouter