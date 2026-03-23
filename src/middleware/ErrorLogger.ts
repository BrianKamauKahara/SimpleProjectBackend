const { logEvents } = require('./EventLogger')
import { type Request, type Response, type NextFunction } from 'express'
import { AppError } from '../models/Errors'

const errorLogger = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    logEvents(`${err.name}:\t ${err.message}\t${req.method}\t${req.headers.origin}\t${req.url}\n`, 'errLog.log')

    console.error(err.stack)

    return res
        .status(err instanceof AppError ? err.statusCode : 500)
        .json(process.env.NODE_ENV === 'development' ? err.stack : { message: 'Internal Server Error' })
}


module.exports = errorLogger 