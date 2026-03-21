const { pathFor } = require('../config/paths')
const Note = require(pathFor('models', 'Note'))

// // ---- UTIL
const wrapAsync = async (promise, {onSuccess, onError} = {}) => {
    try {
        const result = await promise

        return onSuccess ? onSuccess(result) : result
    } catch (err) {
        throw onError ? onError(err) : err
    }
}

// // -------- FUNC
const dbGetAllNotes = async (config = {}) => await wrapAsync(Note.findAll(config))

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


