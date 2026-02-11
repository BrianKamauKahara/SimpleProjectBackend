const { logEvents } = require('./EventLogger')

const errorLogger = (err, req) => {
    logEvents(`${err.name}:\t ${err.message}\t${req.method}\t${req.headers.origin}\t${req.url}\n`, 'errLog.log')
    console.error(err.stack)
}


module.exports = errorLogger 