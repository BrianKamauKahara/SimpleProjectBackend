import express from 'express'
const router = express.Router()

import {
    getAllNotes,
    getNote,
    addNote,
    updateNote,
    deleteNote
} from '../controllers/notesController'

router.route('/')
    .get(getAllNotes)
    .post(addNote)

router.route('/:id')
    .get(getNote)
    .patch(updateNote)
    .delete(deleteNote)

module.exports = router