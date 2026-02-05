const { pathFor } = require('../config/paths')
const Note = require(pathFor('models', 'Note'))

// // --------UTIL
const foundNoteProcessor = (doc) => {
    if (doc != null) {
        return { success: true, data: doc }
    } else {
        return { success: false, error: { code: 'not-found', message: 'Document does not exist' } }
    }
}

const wrapAsync = async (promise, { onSuccess = undefined, onError = undefined } = {}) => {
    try {
        const result = await promise

        return onSuccess ? await onSuccess(result) : { success: true, data: result }
    } catch (err) {
        return onError ? await onError(err) : { success: false, error: err }
    }
}

// // --------FUNC
const dbGetAllNotes = async () => await wrapAsync(Note.findAll())

const dbGetNote = async (id) => await wrapAsync(Note.findById(id), { onSuccess: foundNoteProcessor })

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


