const logger = require("./logger")
const jwt = require("jsonwebtoken")
const User = require("../models/user")

const requestLogger = (req, res, next) => {
    logger.info("Method:", req.method)
    logger.info("Path:  ", req.path)
    logger.info("Body:  ", req.body)
    logger.info("---")
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "unknown endpoint"})
}

const tokenExtractor = (req, res, next) => {
    const authorization = req.get("authorization")
    //console.log("weeee", authorization)
    //console.log("5")
    if (authorization && authorization.startsWith("Bearer ")) {
        //console.log("Bearer")
        const trueToken = authorization.replace("Bearer ", "")
        req.token = trueToken
    } else {
        req.token = null
    }
    next()
}

const userExtractor = async (req, res, next) => {
    const authorization = req.get("authorization")
    let decodedToken
    if (authorization && authorization.startsWith("Bearer ")) {
        const trueToken = authorization.replace("Bearer ", "")
        decodedToken = jwt.verify(trueToken, process.env.SECRET)
    }
    if (!decodedToken) {
        return res.status(401).json({error: "token invalid"})
      }
    const user = await User.findById(decodedToken.id)
    if (!user) {
        return res.status(401).json({error: "user not found"})
    }
    req.user = user
    next()
}

const errorHandler = (error, req, res, next) => {
    logger.error(error.message)

    if (error.name === "CastError") {
        return res.status(400).send({error: "malformatted id"})
    } else if (error.name === "ValidationError") {
        return res.status(400).json({error: error.message})
    } else if (error.name === "MongoServerError" && error.message.includes("E11000 duplicate key error")) {
        return res.status(400).json({error: error.message})
    } else if (error.name === "JsonWebTokenError") {
        //console.log("3")
        return res.status(400).json({error: "token missing or invalid"})
    }

    next(error)
}

module.exports = {requestLogger, unknownEndpoint, errorHandler, tokenExtractor, userExtractor}