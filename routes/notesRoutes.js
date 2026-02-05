const express = require('express')
const router = express.Router()

const { pathFor } = require('../config/paths')
const { 
    getAllNotes,
    getNote,
    addNote,
    updateNote,
    deleteNote
} = require(pathFor('controllers', 'notesController'))

router.route('/')
    .get(getAllNotes)
    .post(addNote)

router.route('/:id')
    .get(getNote)
    .patch(updateNote)
    .delete(deleteNote)

module.exports = router