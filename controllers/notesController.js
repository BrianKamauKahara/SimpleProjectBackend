const asyncHandler = require('express-async-handler')
const { pathFor } = require('../config/paths')
const {
    dbGetAllNotes,
    dbGetNote,
    dbCreateAndStoreNote,
    dbUpdateNote,
    dbDeleteNote
} = require(pathFor('services', 'noteServices.js'))

// // --------UTIL
const mongooseErrorStatus = {
    // Client errors
    ValidationError: 400,         // Schema validation failed (missing/invalid fields)
    CastError: 400,               // Invalid type or ObjectId
    DocumentNotFoundError: 404,   // Requested document not found
    VersionError: 409,            // __v version conflict during save/update

    // Server/DB errors
    MongoServerError: 500,        // MongoDB server issues (duplicate key, etc.)
    MongooseServerSelectionError: 500, // Cannot connect to DB
    MongooseTimeoutError: 500,    // Timeout connecting to DB
    MongooseError: 500,           // Generic Mongoose error

    // Optional network-level errors
    ConnectionError: 500,         // DB connection lost
}

const configureResult = (result, expectedSuccessCode, {expectedDataMap, expectedErrorMap = null} = {}) => {
    return result.success ? {
            data: expectedDataMap? expectedDataMap(result.data) : result.data,
            status: expectedSuccessCode
        } : configureError(result.error, expectedErrorMap)
}

const configureError = (err, expectedErrorMap = null) => {
    const errorName = expectedErrorMap?.[err.name]?.name || err.name
    const errorMessage = expectedErrorMap?.[err.name]?.message || err.message

    return {
        data: {
            name: errorName,
            message: errorMessage,
            ...(err.errors && { details: err.errors })
        },
        status: mongooseErrorStatus[err.name] || 500
    }    
}

// // --------FUNC

// @desc Get all notes
// @route GET /
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
    const result = configureResult(await dbGetAllNotes(), 200)

    return res.status(result.status).json(result.data)
})

// @desc Add new note
// @route POST /
// @access Private
const addNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body

    const result = configureResult(await dbCreateAndStoreNote(title, content), 201)

    return res.status(result.status).json(result.data)
})

// @desc Get specified note
// @route GET /:id
// @access Private
const getNote = asyncHandler(async (req, res) => {
    const id = req.params.id

    const result = configureResult(await dbGetNote(id), 200)

    return res.status(result.status).json(result.data)
})

// @desc Update specified note
// @route PATCH /:id
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const id = req.params.id
    const { title, content } = req.body

    const result = configureResult(await dbUpdateNote(id, {title, content}), 200)

    return res.status(result.status).json(result.data)
})


// @desc Delete Update specified note
// @route DELETE /:id
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const id = req.params.id

    const result = configureResult(await dbDeleteNote(id), 200)

    return res.status(result.status).json(result.data)
})

module.exports = {
    getAllNotes,
    getNote,
    addNote,
    updateNote,
    deleteNote
}