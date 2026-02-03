const express = require('express')
const { paths, pathFor } = require('./config/paths')



const app = express()


const logger = require(pathFor('middleware', 'EventLogger.js'))
app.use(express.json())
app.use(logger)
app.use('/', pathFor('routes', 'notesRoutes.js'))