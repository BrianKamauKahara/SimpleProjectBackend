require('dotenv').config({ quiet: true })
const allowedEnv = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production"

const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || (!origin && allowedEnv)) { // Remove for Development
            callback(null, true)
        } else {
            console.log(origin)
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions