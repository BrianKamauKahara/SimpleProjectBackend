const { format } = require('date-fns')
/* const { nanoid } = require('nanoid') */
const fs = require('fs')
const fsPromises = require('fs').promises


const { paths } = require('../config/paths')

const getLogMessage = (message) => `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}\t${generateId(20)}\t${message}`

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

function generateId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}


module.exports = { logger, logEvents }