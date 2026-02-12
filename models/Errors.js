class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

class DocumentNotFoundError extends AppError {
    constructor(message) {
        super(message, 404)
    }
}

class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400)
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400)
    }
}

module.exports = { DocumentNotFoundError, BadRequestError, ValidationError }