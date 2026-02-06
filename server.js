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
const connectDB = require(pathFor('middleware', 'dbConn'))
app.use(express.json())
app.use(logger)
app.use(connectDB)

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


// // ---- FOR DEAR VERCEL
module.exports = app