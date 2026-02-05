// // ---- ENV VARIABLES
require('dotenv').config({ quiet:true })
const PORT = process.env.PORT

// // ---- IMPORTS
const express = require('express')
const { paths, pathFor } = require('./config/paths')


// // ---- APP
const app = express()
const db = require(pathFor('resources', 'database'))


// // ---- MIDDLEWARE
const { logger, logEvents } = require(pathFor('middleware', 'EventLogger'))
app.use(logger)
app.use(express.json())

// // ---- ROUTES
app.use('/', require(pathFor('routes', 'notesRoutes')))


// // ---- ERROR HANDLING
const errorHandler = require(pathFor('middleware', 'errorLogger.js'))
app.use(errorHandler)

app.all(/^\/.*/, (req, res) => {
    res.status(404)

    if (req.accepts('json')) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
})

// // ---- CONNECT TO DATABASE AND START APPLICATION
const connectDB = async () => {
    try {
        await db.collection('notes').limit(1).get()
        console.log('Firestore Initialized')
    } catch (err) {
        console.error('Firestore Initialization Error: ', err)
        process.exit(1)
    }
}

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
})