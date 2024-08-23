const {test, after, describe, beforeEach} = require("node:test")
const assert = require("node:assert")
const supertest = require("supertest")
const app = require("../app")
const mongoose = require("mongoose")
const helper = require("./test_helper")
const User = require("../models/user")
const api = supertest(app)
const bcrypt = require("bcryptjs")
const Blog = require("../models/blog")

describe("Testing the /api/users routes", () => {
    beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
        const blogs = await helper.blogsInDb()

        const blogOne = blogs[0]
        const blogTwo = blogs[1]
        for (let user of helper.initialUsers) {
            let passwordHash = await bcrypt.hash(user.passwordHash, 10)
            user.passwordHash = passwordHash
        }
        const userList = helper.initialUsers.map(user => ({...user, blogs: [blogOne.id, blogTwo.id]}))
        const userObjects = userList.map(user => new User(user))
        const promiseList = userObjects.map(user => user.save())
        await Promise.all(promiseList)
    })
    describe("HTTP GET requests", () => {

        test("a basic get req should go through", async () => {
            await api
                .get("/api/users")
                .expect(200)
                .expect("Content-type", /application\/json/)
            
            const res = await api.get("/api/users")
            assert.strictEqual(res.body.length, helper.initialUsers.length)

        })



    })


    describe("HTTP POST requests", () => {

        test("a basic post req should go through", async () => {
            newUser = {
                username: "bing_bong",
                password: "thispasswordsecure1",
                name: "Ronald East"
            }
            await api
                .post("/api/users")
                .send(newUser)
                .expect(201)
                .expect("Content-type", /application\/json/)

            const dbUsers = await helper.usersInDb()
            const newUserAfter = dbUsers[dbUsers.length - 1]

            assert.strictEqual(newUserAfter.username.includes("bing_bong"), true)
            assert.strictEqual(dbUsers.length, helper.initialUsers.length + 1)
        })
        
        test("username should be unique", async () => {
            newUser = {
                username: "bling_blong",
                password: "thispasswordsecure2",
                name: "Ronald East"
            }
            await api
                .post("/api/users")
                .send(newUser)
                .expect(400)

            const dbUsers = await helper.usersInDb()
            assert.strictEqual(dbUsers.length, helper.initialUsers.length)
        })
        test("user must have a name", async () => {
            newUser = {
                password: "thispasswordsecure3",
                name: "Ronald East"
            }
            await api
                .post("/api/users")
                .send(newUser)
                .expect(400)

            const dbUsersNonExist = await helper.usersInDb()
            assert.strictEqual(dbUsersNonExist.length, helper.initialUsers.length)
        })
        test("username must be at least 3 letters long", async () => {
            newUser = {
                username: "bl",
                password: "thispasswordsecure4",
                name: "Ronald East"
            }
            await api
                .post("/api/users")
                .send(newUser)
                .expect(400)

            const dbUsersMinlength = await helper.usersInDb()
            assert.strictEqual(dbUsersMinlength.length, helper.initialUsers.length)
        })
        test("user must have a password", async () => {
            newUser = {
                username: "bng_bng",
                name: "Ronald East"
            }
            await api
                .post("/api/users")
                .send(newUser)
                .expect(400)

            const dbUsersNonExist = await helper.usersInDb()
            assert.strictEqual(dbUsersNonExist.length, helper.initialUsers.length)

        })

        test("user password must be at least 3 letters long", async () => {
            newUser = {
                username: "bng_bng",
                password: "tw",
                name: "Ronald East"
            }
            await api
                .post("/api/users")
                .send(newUser)
                .expect(400)

            const dbUsersMinlength = await helper.usersInDb()
            assert.strictEqual(dbUsersMinlength.length, helper.initialUsers.length)
        })




    })




})
after(async () => {
    await mongoose.connection.close()
})