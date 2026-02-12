const { logEvents } = require('./EventLogger')

const errorLogger = (err, req, res, next) => {
    logEvents(`${err.name}:\t ${err.message}\t${req.method}\t${req.headers.origin}\t${req.url}\n`, 'errLog.log')

    console.error(err.stack)
    return res.status(err.statusCode ?? 500).json(
        process.env.NODE_ENV === 'development'
            ? err.stack
            : { message: 'Internal Server Error' })
}


module.exports = errorLogger 