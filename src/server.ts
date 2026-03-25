// // ---- ENV VARIABLES
import dotenv from 'dotenv'
dotenv.config({ quiet: true })
const PORT = process.env.PORT || 5000

// // ---- IMPORTS
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import corsOptions from './config/corsOptions'

// // ---- APP
const app = express()


// // ---- MIDDLEWARE
import { logger } from './middleware/EventLogger'
import connectDB from './middleware/dbConn'
app.use(express.json())
app.use(logger)
app.use(cors(corsOptions))
app.use(connectDB)

// // ---- ROUTES
import notesRoutes from './routes/notesRoutes'
app.use('/notes', notesRoutes)

// // ---- ERROR HANDLING
import errorLogger from './middleware/ErrorLogger'
app.use(errorLogger)

app.all(/^\/.*/, (req: Request, res: Response) => {
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

