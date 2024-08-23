const express = require('express')
require("express-async-errors")
const app = express()
const mongoose = require('mongoose')
const blogsRouter = require("./controllers/blogs")
const usersRouter = require("./controllers/users")
const loginRuoter = require("./controllers/login")
const config = require("./utils/config")
const cors = require("cors")
const middleware = require("./utils/middleware")
const logger = require("./utils/logger")

// mongoose.set("strictQuery", false)

logger.info(`Connecting to ${config.mongoUrl}`)

mongoose.connect(config.mongoUrl)
    .then(() => {
        logger.info(`Connected to MongoDB`)
    })
    .catch((error) => {
        logger.error(`Couldn't connect to MongoDB: ${error.message}`)
    })


app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use("/api/blogs", blogsRouter)
app.use("/api/users", usersRouter)
app.use("/api/login", loginRuoter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
