const {test, after, describe, beforeEach} = require("node:test")
const assert = require("node:assert")
const supertest = require("supertest")
const app = require("../app")
const mongoose = require("mongoose")
const helper = require("./test_helper")
const Blog = require("../models/blog")
const api = supertest(app)
const User = require("../models/user")
const jwt = require("jsonwebtoken")

describe("when all the blogs are initially saved", () => {
    //console.log("Starting blog_api tests:\n")
    beforeEach(async () => {
        //console.log("Executing beforeEach / awaiting until test goes through\n---")
        await Blog.deleteMany({})
        await User.deleteMany({})
        const loginUsers = await helper.initialLogin()
        await User.insertMany(loginUsers)
        //console.log("Deleted all blogs")
        const users = await helper.usersInDb()
        const blogList = helper.initialBlogs.map(blog => ({...blog, user: users[0].id}))
        //console.log("??????", blogList[0])
        const blogObjects = blogList.map(blog => new Blog(blog))
        //console.log(blogObjects[0])
        //console.log("Created new blog objects")
        const promiseArray = blogObjects.map(blog => blog.save())
        await Promise.all(promiseArray)
        //console.log("Saved all the blog objects\n---")
        const userList = await helper.usersInDb()
        const someUser = userList[0]

        userForToken = {
            username: someUser.username,
            id: someUser.id
        }
    })

    describe("HTTP GET: when all the blogs are returned", () => {

        test("blogs are returned as json | status 200", async () => {
            const res = await api
                .get("/api/blogs")
                .expect(200)
                .expect("Content-type", /application\/json/)

            assert.strictEqual(res.body.length, helper.initialBlogs.length)
        })

        test("HTTP GET: all blogs are returned", async () => {
            const res = await api.get("/api/blogs")

            assert.strictEqual(res.body.length, helper.initialBlogs.length)
        })

        test("HTTP GET: of all the blogs they include a certain title", async () => {
            const res = await api.get("/api/blogs")
            const titles = res.body.map(blog => blog.title)
            
            assert.strictEqual(titles.includes("React patterns"), true)
        })

        test("the identfying field should be id, not _id", async () => {
            const res = await api.get("/api/blogs")
            const individual = Object.keys(res.body[1])

            assert.strictEqual(individual.includes("id") && !individual.includes("_id"), true)

        })
    })

    describe("HTTP POST: addition of blogs", () => {

        test("blogs length is added by one | status 201", async () => {
            const userToken = jwt.sign(userForToken, process.env.SECRET)
            
            const newBlog = {
                title: "Bing bong",
                author: "Ding dong",
                url: "https://somewhere.com/",
                likes: 5
              }
            
            await api
                .post("/api/blogs")
                .send(newBlog)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(201)
                .expect("Content-type", /application\/json/)

            const dbBlogs = await helper.blogsInDb()
            assert.strictEqual(dbBlogs.length, helper.initialBlogs.length + 1)
        })

        test("blog with no token should not go through | status 401", async () => {
            //const userToken = jwt.sign(userForToken, process.env.SECRET)
            
            const newBlog = {
                title: "Bing bong",
                author: "Ding dong",
                url: "https://somewhere.com/",
                likes: 5
              }
            
            await api
                .post("/api/blogs")
                .send(newBlog)
                //.set("Authorization", `Bearer ${userToken}`)
                .expect(401)

            const dbBlogs = await helper.blogsInDb()
            assert.strictEqual(dbBlogs.length, helper.initialBlogs.length)
        })

        test("blog with a faulty token should not go through | status 401", async () => {
            const userToken = jwt.sign(userForToken, process.env.SECRET)
            
            const newBlog = {
                title: "Bing bong",
                author: "Ding dong",
                url: "https://somewhere.com/",
                likes: 5
              }
            
            await api
                .post("/api/blogs")
                .send(newBlog)
                .set("Authorization", `Beare ${userToken}`)
                .expect(401)

            const dbBlogs = await helper.blogsInDb()
            assert.strictEqual(dbBlogs.length, helper.initialBlogs.length)
        })

        test("blog with no author should not go through | status 400", async () => {
            const userToken = jwt.sign(userForToken, process.env.SECRET)

            const newBlog = {
                title: "Bing bong",
                url: "https://somewhere.com/",
                likes: 5
              }
            await api
              .post("/api/blogs")
              .send(newBlog)
              .set("Authorization", `Bearer ${userToken}`)
              .expect(400)

            const dbBlogs = await helper.blogsInDb()
            assert.strictEqual(dbBlogs.length, helper.initialBlogs.length)
        })

        test("likes default value should be 0 | status 201", async () => {
            const userToken = jwt.sign(userForToken, process.env.SECRET)
            
            const newBlog = {
                title: "Bing bong",
                author: "ding dong",
                url: "https://somewhere.com/"
              }
            await api
              .post("/api/blogs")
              .send(newBlog)
              .set("Authorization", `Bearer ${userToken}`)
              .expect(201)
              .expect("Content-type", /application\/json/)
            const dbBlogs = await helper.blogsInDb()
            const latestBlog = dbBlogs[helper.initialBlogs.length]
            assert.strictEqual(latestBlog.likes, 0)
        })

        test("blog with no title and no url should not go through | status 400", async () => {
            const userToken = jwt.sign(userForToken, process.env.SECRET)

            const newBlog = {
                author: "ding dong",
                likes: 5
              }
            await api
              .post("/api/blogs")
              .send(newBlog)
              .set("Authorization", `Bearer ${userToken}`)
              .expect(400)

            const dbBlogs = await helper.blogsInDb()
            assert.strictEqual(dbBlogs.length, helper.initialBlogs.length)
        })
    })
    describe("HTTP DELETE: deletion of a single blog", () => {
        test("the length should stay the same and should not include the posted and deleted | status 201 and 204", async () => {
            const userToken = jwt.sign(userForToken, process.env.SECRET)
            const newBlog = helper.initialBlogs[0]
            await api
                .post("/api/blogs")
                .send(newBlog)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(201)
                .expect("Content-type", /application\/json/)

            const blogs = await helper.blogsInDb()
            const deletableBlog = blogs[6]

            await api
                .delete(`/api/blogs/${deletableBlog.id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(204)
            const blogsMinusOne = await helper.blogsInDb()

            assert.strictEqual(blogsMinusOne.length, helper.initialBlogs.length)

            const blogsMinusOneIds = blogsMinusOne.map(blog => blog.id)
            assert.strictEqual(!blogsMinusOneIds.includes(deletableBlog.id), true)

        })

        test("blog with no token shouldn't be deleted | status 201 and 401", async () => {
            const userToken = jwt.sign(userForToken, process.env.SECRET)
            const newBlog = helper.initialBlogs[0]
            await api
                .post("/api/blogs")
                .send(newBlog)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(201)
                .expect("Content-type", /application\/json/)

            const blogs = await helper.blogsInDb()
            const deletableBlog = blogs[6]

            await api
                .delete(`/api/blogs/${deletableBlog.id}`)
                //.set("Authorization", `Bearer ${userToken}`)
                .expect(401)
            const blogsMinusOne = await helper.blogsInDb()

            assert.strictEqual(blogsMinusOne.length, helper.initialBlogs.length + 1)

            const blogsMinusOneIds = blogsMinusOne.map(blog => blog.id)
            assert.strictEqual(blogsMinusOneIds.includes(deletableBlog.id), true)

        })

        test("blog with faulty token shouldn't be deleted | status 201 and 401", async () => {
            const userToken = jwt.sign(userForToken, process.env.SECRET)
            const newBlog = helper.initialBlogs[0]
            await api
                .post("/api/blogs")
                .send(newBlog)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(201)
                .expect("Content-type", /application\/json/)

            const blogs = await helper.blogsInDb()
            const deletableBlog = blogs[6]

            await api
                .delete(`/api/blogs/${deletableBlog.id}`)
                .set("Authorization", `Beare ${userToken}`)
                .expect(401)
            const blogsMinusOne = await helper.blogsInDb()

            assert.strictEqual(blogsMinusOne.length, helper.initialBlogs.length + 1)

            const blogsMinusOneIds = blogsMinusOne.map(blog => blog.id)
            assert.strictEqual(blogsMinusOneIds.includes(deletableBlog.id), true)

        })

        test("should not work with non existing id | status 201", async () => {
            const userToken = jwt.sign(userForToken, process.env.SECRET)
            const newBlog = helper.initialBlogs[0]
            await api
                .post("/api/blogs")
                .send(newBlog)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(201)
                .expect("Content-type", /application\/json/)


            const nonExistingId = await helper.nonExistingId()
            const blogsID = await helper.blogsInDb()
            await api
                .delete(`/api/blogs/${nonExistingId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(404)
            const blogs = await helper.blogsInDb()
            assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
        })
    })
    describe("HTTP PUT: changing a specific blog", () => {
        test("a basic change of first blog should go through | status 200", async () => {
            const newBlog = {
                title: "Another",
                author: "One",
                url: "http://www.something.html",
                likes: 5
              }
            const dbBlogs = await helper.blogsInDb()
            const firstBlog = dbBlogs[0]
            await api
              .put(`/api/blogs/${firstBlog.id}`)
              .send(newBlog)
              .expect(200)
              .expect("Content-type", /application\/json/)

            const dbBlogsAfter = await helper.blogsInDb()
            const firstBlogAfter = dbBlogsAfter[0]

            assert.strictEqual(firstBlogAfter.author.includes("One"), true)
            assert.strictEqual(dbBlogsAfter.length, helper.initialBlogs.length)
        })

        test("partial blog should go through in put | status 200", async () => {
            const newBlog = {
                title: "Another",
                url: "http://www.something.html"
              }
            const dbBlogs = await helper.blogsInDb()
            const firstBlog = dbBlogs[0]
            await api
              .put(`/api/blogs/${firstBlog.id}`)
              .send(newBlog)
              .expect(200)
            const dbBlogsAfter = await helper.blogsInDb()
            const firstBlogAfter = dbBlogsAfter[0]
        })
        test("partial blog wiht no title should not go through in put | status 400", async () => {
            const newBlog = {
                title: "",
                url: "http://www.something.html"
              }
            const dbBlogs = await helper.blogsInDb()
            const firstBlog = dbBlogs[0]
            await api
              .put(`/api/blogs/${firstBlog.id}`)
              .send(newBlog)
              .expect(400)
            const dbBlogsAfter = await helper.blogsInDb()
            const firstBlogAfter = dbBlogsAfter[0]
        })





    })

})

after(async () => {
    await mongoose.connection.close()
})