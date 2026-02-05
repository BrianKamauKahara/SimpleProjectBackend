const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises


const { paths } = require('../config/paths')

const getLogMessage = (message) => `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}\t${uuid()}\t${message}`

const logEvents = async (message, fileName) => {
    const logItem = getLogMessage(message)

    try {
        if (!fs.existsSync(paths.logs)) {
            throw new Error('Please provide a path to store logs')
        }

        await fsPromises.appendFile(paths.subPaths('logs', fileName), logItem)
    } catch (err) {
        console.error(err)
    }
}

const logger = (req, res, next) => {
    const origin = req.headers.origin ?? 'no-origin'
    const path = req.originalUrl ?? req.url ?? 'unknown-path'
     
    logEvents(`${req.method}\t${origin}\t${path}\n`, 'requestLogs.log')
    console.log(`${req.method}\t${path}`)
    next()  
}

module.exports = { logger, logEvents }