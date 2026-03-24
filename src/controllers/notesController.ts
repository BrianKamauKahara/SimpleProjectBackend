import { type Request, type Response } from "express"
import {
    dbGetAllNotes,
    dbGetNote,
    dbCreateAndStoreNote,
    dbUpdateNote,
    dbDeleteNote,
    noteSchema
} from '../models/Note'
import { BadRequestError, ValidationError } from '../models/Errors'
import { z } from 'zod'
import { findAllQueryParams, type findAllQueryConfig } from "../models/FireBaseModel"

// // --------UTIL
const parseId = (id: string | string[] | undefined): string | never => {
    if (Array.isArray(id)) {
        throw new BadRequestError('Invalid ID format')
    }

    if (!id || id.trim() === '') throw new BadRequestError('Missing ID')

    return id
}

const parseNoteData = (body: Record<any, any>): z.infer<typeof noteSchema> | never => {
    const result = noteSchema.safeParse(body)

    if (!result.success) {
        throw new ValidationError(result.error.message)
    }

    return result.data
}

const parseQuery = (qry: Record<any, any>): findAllQueryConfig | never => {
    const result = findAllQueryParams.safeParse(qry)

    if (!result.success) {
        throw new BadRequestError(result.error.message)
    }

    return result.data
}

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
    const { title, content } = parseNoteData(req.body)

    const updatedNote = await dbUpdateNote(id, { title, content })

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

module.exports = {
    getAllNotes,
    getNote,
    addNote,
    updateNote,
    deleteNote
}