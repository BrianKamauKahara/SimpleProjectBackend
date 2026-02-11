const asyncHandler = require('express-async-handler')
const { pathFor } = require('../config/paths')
const {
    dbGetAllNotes,
    dbGetNote,
    dbCreateAndStoreNote,
    dbUpdateNote,
    dbDeleteNote
} = require(pathFor('services', 'noteServices'))
const errorLogger = require(pathFor('middleware', 'ErrorLogger'))
// // --------UTIL
const errorCodes = {
    'not-found': 404,
    5: 404, // gRPC fallback
    'already-exists': 409,
    6: 409,
    'permission-denied': 403,
    7: 403,
    'unavailable': 500,
    14: 500,
    'bad-request': 400
}


const configureResult = (req, result, expectedSuccessCode, { expectedDataMap = null, expectedErrorMap = null } = {}) => {
    if (result.success) {
        return expectedDataMap
            ? expectedDataMap(result)
            : { status: expectedSuccessCode, data: result.data };
    } else {
        errorLogger(result.error, req) // Not Perfect, Further improvement needed
        console.log(result)
        return expectedErrorMap
            ? expectedErrorMap(result)
            : {
                status: errorCodes[result.error.code] ?? 500,
                data: {
                    message: result.error.message,
                    code: result.error.code,
                    stack: process.env.NODE_ENV === 'development' ? result.error.stack : undefined
                }
            }
    }
}

// // --------FUNC

// @desc Get all notes
// @route GET /
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
    const { startDocId, limit, asc } = req.query
    const result = configureResult(req, await dbGetAllNotes(
        {
            startDocId: startDocId || null,
            limit: parseInt(limit) || 2,
            asc: asc === 'true'
        }),
        200)

    return res.status(result.status).json(result.data)
})

// @desc Add new note
// @route POST /
// @access Private
const addNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body

    const result = configureResult(req, await dbCreateAndStoreNote(title, content), 201)

    return res.status(result.status).json(result.data)
})

// @desc Get specified note
// @route GET /:id
// @access Private
const getNote = asyncHandler(async (req, res) => {
    const id = req.params.id

    const result = configureResult(req, await dbGetNote(id), 200)

    return res.status(result.status).json(result.data)
})

// @desc Update specified note
// @route PATCH /:id
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const id = req.params.id
    const { title, content } = req.body

    const result = configureResult(req, await dbUpdateNote(id, { title, content }), 200)

    return res.status(result.status).json(result.data)
})


// @desc Delete Update specified note
// @route DELETE /:id
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const id = req.params.id

    const result = configureResult(req, await dbDeleteNote(id), 200)

    return res.status(result.status).json(result.data)
})

module.exports = {
    getAllNotes,
    getNote,
    addNote,
    updateNote,
    deleteNote
}