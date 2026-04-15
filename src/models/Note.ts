import FireBaseModel from './FireBaseModel.js'
import { z } from 'zod'
import { connectDB } from '../resources/database.js'
/**
 * Define the schema for a Note.
 * - title: required non-empty string
 * - content: required non-empty string
 * Using Zod for runtime validation.
 */
export const noteSchema = z.object({
    title: z.string().trim().min(1, { error: 'Title must be a non-empty string' }),
    content: z.string().trim().min(1, { error: 'Content must be a non-empty string' }),
})
export type NoteType = z.infer<typeof noteSchema>


/**
 * Create a FireBaseModel instance for notes collection.
 * Provides CRUD methods for interacting with Firestore.
*/
export const Note = new FireBaseModel(connectDB(), 'notes', noteSchema)

/**
 * Helper functions for database operations.
*/
import { type findAllQueryConfig } from './FireBaseModel.js'

// Retrieve all notes with optional query config 
export const dbGetAllNotes = async (config: findAllQueryConfig) =>
    await Note.findAll(config)

// Retrieve a single note by its ID.
export const dbGetNote = async (id: string) =>
    await Note.findById(id)

// Create and store a new note. Accepts an object matching NoteType
export const dbCreateAndStoreNote = async (note: NoteType) =>
    await Note.create(note)

// Update an existing note by ID. Accepts partial updates validated by FireBaseModel.
export const dbUpdateNote = async (id: string, note: Partial<NoteType>) =>
    await Note.updateById(id, note)

// Delete a note by its ID.
export const dbDeleteNote = async (id: string) =>
    await Note.deleteById(id)
