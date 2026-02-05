const { logEvents } = require('./EventLogger')

const errorLogger = (err, req, res, next) => {
    logEvents(`${err.name}:\t ${err.message}\t${req.method}\t${req.headers.origin}\t${req.url}\n`, 'errLog.log')
    console.error(err.stack)

    res.status(res.statusCode ?? 500).json({ 'message': err.message })
}


module.exports = errorLogger 