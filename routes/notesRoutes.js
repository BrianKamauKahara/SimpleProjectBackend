const express = require('express')
const router = express.router()

const { pathFor } = require('../config/paths')
const { 
    getAllNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote
} = require(pathFor('controllers', 'notesController'))

router.route('/')
    .get(getAllNotes)
    .post(createNote)

router.route('/:id')
    .get(getNote)
    .patch(updateNote)
    .delete(deleteNote)

module.exports = router