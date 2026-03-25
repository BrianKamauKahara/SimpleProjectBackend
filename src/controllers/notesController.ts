import { type Request, type Response } from "express"
import {
    dbGetAllNotes,
    dbGetNote,
    dbCreateAndStoreNote,
    dbUpdateNote,
    dbDeleteNote
} from '../models/Note'

// // -------- UTIL
import { parseId, parseNoteData, parseNoteDataPartial, parseQuery } from '../utils/controllerUtils'

// // -------- ROUTES

// @desc Get all notes
// @route GET /
// @access Private
export const getAllNotes = async (req: Request, res: Response) => {
    const { startDocId, limit, order } = parseQuery(req.query)

    const notes = await dbGetAllNotes({ startDocId, limit, order })

    return res.status(200).json(notes)
}

// @desc Add new note
// @route POST /
// @access Private
export const addNote = async (req: Request, res: Response) => {
    const { title, content } = parseNoteData(req.body)

    const newNote = await dbCreateAndStoreNote({ title, content })

    return res.status(201).json(newNote)
}

// @desc Get specified note
// @route GET /:id
// @access Private
export const getNote = async (req: Request, res: Response) => {
    const id = parseId(req.params.id)

    const note = await dbGetNote(id)

    return res.status(200).json(note)
}

// @desc Update specified note
// @route PATCH /:id
// @access Private
export const updateNote = async (req: Request, res: Response) => {
    const id = parseId(req.params.id)
    const noteData = parseNoteDataPartial(req.body)

    const updatedNote = await dbUpdateNote(id, noteData)

    return res.status(200).json(updatedNote)
}

// @desc Delete Update specified note
// @route DELETE /:id
// @access Private
export const deleteNote = async (req: Request, res: Response) => {
    const id = parseId(req.params.id)

    const result = await dbDeleteNote(id)

    return res.sendStatus(204)
}
