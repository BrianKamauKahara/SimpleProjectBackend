// // ---- ENV VARIABLES
require('dotenv').config({ quiet: true })
const PORT = process.env.PORT

// // ---- IMPORTS
const express = require('express')
const cors = require('cors')
const { paths, pathFor } = require('./config/paths')
const corsOptions = require('./config/corsOptions')


// // ---- APP
const app = express()
const db = require(pathFor('resources', 'database'))


// // ---- MIDDLEWARE
const { logger, logEvents } = require(pathFor('middleware', 'EventLogger'))
const connectDB = require(pathFor('middleware', 'dbConn'))
app.use(express.static(paths.static))
app.use(express.json())
app.use(logger)
app.use(cors(corsOptions))
app.use(connectDB)

// // ---- ROUTES
app.use('/notes', require(pathFor('routes', 'notesRoutes')))


// // ---- ERROR HANDLING
const errorLogger = require(pathFor('middleware', 'ErrorLogger'))
app.use(errorLogger)

app.all(/^\/.*/, (req, res) => {
    res.status(404)

    if (req.accepts('json')) {
        res.json({ error: "Invalid Request" });
    } else {
        res.type('txt').send("404 Not Found");
    }
})


// // ---- FOR DEVELOPMENT
const env = process.env.NODE_ENV || null;

if (env === "development") {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}


// // ---- FOR DEAR VERCEL
module.exports = app

