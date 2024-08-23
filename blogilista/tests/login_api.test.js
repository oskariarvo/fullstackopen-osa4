const {test, after, beforeEach, describe} = require("node:test")
const assert = require("node:assert")
const supertest = require("supertest")
const app = require("../app")
const mongoose = require("mongoose")
const helper = require("./test_helper")
const User = require("../models/user")
const api = supertest(app)
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

describe("testing login_api.test", () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const loginUsers = await helper.initialLogin()
        await User.insertMany(loginUsers)
    })
    test("a correct username and login should work", async () => {
        const loginUser = {
            username: "bling_blong",
            password: "thispasswordissecure"
        }
        const res = await api
            .post("/api/login")
            .send(loginUser)
            .expect(200)
            .expect("Content-type", /application\/json/)

    })
    test("an incorrect username should not work", async () => {
        const loginUser = {
            username: "bling_blong",
            password: "thispasswordis"
        }
        const res = await api
            .post("/api/login")
            .send(loginUser)
            .expect(401)
            .expect("Content-type", /application\/json/)
    })
    test("an incorrect password should not work", async () => {
        const loginUser = {
            username: "bling",
            password: "thispasswordissecure"
        }
        const res = await api
            .post("/api/login")
            .send(loginUser)
            .expect(401)
            .expect("Content-type", /application\/json/)
    })



})

after(async () => {
    await mongoose.connection.close()
})