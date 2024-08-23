const usersRouter = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcryptjs")
const Blog = require("../models/blog")

usersRouter.get("/", async (req, res, next) => {
    const users = await User.find({}).populate("blogs", {title: 1, author: 1, url: 1, id: 1})
    res.json(users)
})

usersRouter.post("/", async (req, res, next) => {

    saltRounds = 10
    if (!req.body.password) {
        return res.status(400).json({error: "Password is required"})
    } else if (req.body.password.length < 3) {
        return res.status(400).json({error: "Password must be at least 3 characters long"})
    }
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds)

    const newUser = new User({
        username: req.body.username,
        passwordHash: passwordHash,
        name: req.body.name
    })
    const savedUser = await newUser.save()
    res.status(201).json(savedUser)
})

module.exports = usersRouter