const e = require("express")
const app = e()
const admin = require("firebase-admin")
const port = 3000

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require("./serviceAccountKey.js")),
    })
}

const lib = admin.app()
const db = lib.firestore()

app.use(e.json())
app.use(async (req, res, next) => {
    // redirect if the route is not under /api
    if (req.url.startsWith("/api")) {
        next()
    } else {
        res.redirect("http://hyperfest.rf.gd")
    }
})
app.use(async (req, res, next) => {
    if (req.headers.authorization == require("./key.js")) {
        next()
    } else {
        res.status(401).send("Unauthorized")
    }
})

app.get("/api/getUser", async (req, res) => {
    if (req.query.userid) {
        if ((await db.collection("user").doc(req.query.userid).get()).exists) {
            const user = await db.collection("user").doc(req.query.userid).get()
            res.status(200).send(user.data())
        } else {
            res.status(404).send("User not found")
        }
    } else {
        res.status(400).send("Bad request")
    }
})

app.post("/api/registerUser", async (req, res) => {
    if (req.body.userid) {
        await db.collection("user").doc(req.body.userid).set({
            hasTicket: false
        })
        res.status(200).send("Success")
    } else {
        res.status(400).send("Bad request")
    }
})

app.patch("/api/boughtTicket", async (req, res) => {
    if (req.body.userid) {
        await db.collection("user").doc(req.body.userid).update({
            hasTicket: true
        })
        res.status(200).send("Success")
    } else {
        res.status(400).send("Bad request")
    }
})

app.listen(port, () => {
    console.log("Listening on port", port)
})

module.exports = app