const { pathFor } = require('../config/paths')
const Note = require(pathFor('models', 'Note'))

// // --------UTIL
const deleteNoteProcessor = (id) => (result) =>
    result ? { success: true, data: result } :
             { success: false, error: { name: 'DocumentNotFoundError', message: `Note with id ${id} does not exist` } }

const callAsync = async (promise, { dataProcess, errorProcess = undefined } = {}) => {
    try {
        const result = await promise

        return dataProcess ? dataProcess(result) : { success: true, data: result }
    } catch (err) {
        return errorProcess ? errorProcess(err) : { success: false, error: err }
    }
}

// // --------FUNC
const dbGetAllNotes = async () => await callAsync(Note.find().lean())

const dbGetNote = async (id) => await callAsync(Note.findById(id).lean())

const dbCreateAndStoreNote = async (title, content) => await callAsync(Note.create({ title, content }))

const dbUpdateNote = async (id, { title, content }) =>
    await callAsync(Note.findByIdAndUpdate(id, { title, content }, { new: true, runValidators: true }))

const dbDeleteNote = async (id) => await callAsync(Note.findByIdAndDelete(id), {
    'dataProcess': deleteNoteProcessor(id)
})

module.exports = {
    dbGetAllNotes,
    dbGetNote,
    dbCreateAndStoreNote,
    dbUpdateNote,
    dbDeleteNote
}