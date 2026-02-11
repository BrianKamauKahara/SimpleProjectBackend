const { pathFor } = require('../config/paths')
const Note = require(pathFor('models', 'Note'))

// // --------UTIL
const wrapAsync = async (promise, { onSuccess = undefined, onError = undefined } = {}) => {
    try {
        const result = await promise

        return onSuccess ? await onSuccess(result) : { success: true, data: result }
    } catch (err) {
        return onError ? await onError(err) : { success: false, error: err }
    }
}

// // --------FUNC
const dbGetAllNotes = async ({ startDocId, limit, asc } = {}) => await wrapAsync(Note.findAll({ startDocId, limit, asc }))

const dbGetNote = async (id) => await wrapAsync(Note.findById(id))

const dbCreateAndStoreNote = async (title, content) => await wrapAsync(Note.create({ title, content }))

const dbUpdateNote = async (id, { title, content }) => await wrapAsync(Note.updateById(id, { title, content }))

const dbDeleteNote = async (id) => await wrapAsync(Note.deleteById(id))

module.exports = {
    dbGetAllNotes,
    dbGetNote,
    dbCreateAndStoreNote,
    dbUpdateNote,
    dbDeleteNote
}


