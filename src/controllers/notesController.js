const asyncHandler = require('express-async-handler')
const { pathFor } = require('../config/paths')
const {
    dbGetAllNotes,
    dbGetNote,
    dbCreateAndStoreNote,
    dbUpdateNote,
    dbDeleteNote
} = require(pathFor('services', 'noteServices'))


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


const resultHandler = async (promise, successCode = 200) => {
    try {
        const result = await promise

        return {
            statusCode: successCode,
            data: result
        }
    } catch (err) {
        if (!err.isOperational) throw err

        console.log(err)
        return {
            statusCode: err.statusCode || errorCodes[err.code],
            data: {
                message: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
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

    const result = await resultHandler(dbGetAllNotes(
        {
            startDocId: startDocId || null,
            limit: parseInt(limit) || 2,
            asc: asc === 'true'
        }))

    return res.status(result.statusCode).json(result.data)
})

// @desc Add new note
// @route POST /
// @access Private
const addNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body

    const result = await resultHandler(dbCreateAndStoreNote(title, content), 201)

    return res.status(result.statusCode).json(result.data)
})

// @desc Get specified note
// @route GET /:id
// @access Private
const getNote = asyncHandler(async (req, res) => {
    const id = req.params.id

    const result = await resultHandler(dbGetNote(id))

    return res.status(result.statusCode).json(result.data)
})

// @desc Update specified note
// @route PATCH /:id
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const id = req.params.id
    const { title, content } = req.body

    const result = await resultHandler(dbUpdateNote(id, { title, content }))

    return res.status(result.statusCode).json(result.data)
})


// @desc Delete Update specified note
// @route DELETE /:id
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const id = req.params.id

    const result = await resultHandler(dbDeleteNote(id))

    return res.status(result.statusCode).json(result.data)
})

module.exports = {
    getAllNotes,
    getNote,
    addNote,
    updateNote,
    deleteNote
}