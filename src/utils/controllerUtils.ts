import { type Request } from 'express'
import { BadRequestError, ValidationError } from "../models/Errors"
import { type findAllQueryConfig } from "../types/basemodel.types"
import { noteSchema, type NoteType } from "../models/Note"
import z from 'zod'


export const findAllQueryParams = z.object({
    startDocId: z.string().trim().optional(),
    limit: z.coerce.number<number>().optional(),
    order: z.literal(['asc', 'desc']).optional()
})

// Util Utils LOL (it's not funny)
export const stripUndefinedFields = (o: Record<string, any>): Record<string, any> | never => {
    return Object.fromEntries(
        Object.entries(o).filter(([, v]) => v !== undefined)
    )
}

export const throwNonObjects = (o: unknown): Record<string, any> | never => {
    if ((typeof o !== 'object') || o === null || Array.isArray(o)) {
        throw new BadRequestError(`Expected body to be object, received: ${typeof o}`)
    }
    return o
}

// Actual Utils
export const parseId = (id: string | string[] | undefined): string | never => {
    if (Array.isArray(id)) {
        throw new BadRequestError('Invalid ID format')
    }

    if (!id || id.trim() === '') throw new BadRequestError('Missing ID')

    return id
}

export const parseNoteData = (body: Request['body']): NoteType | never => {
    const bodyAsObject = throwNonObjects(body)

    const result = noteSchema.safeParse(bodyAsObject)

    if (!result.success) {
        throw new ValidationError(result.error.message)
    }

    return result.data
}

export const parseNoteDataPartial = (body: Request['body']): Partial<NoteType> | never => {
    const bodyAsObject = throwNonObjects(body)

    const strippedObject = stripUndefinedFields(bodyAsObject)

    if (!Object.keys(strippedObject).length) {
        throw new ValidationError('Nothing to update')
    }

    const result = noteSchema.partial().safeParse(strippedObject)

    if (!result.success) {
        throw new ValidationError(result.error.message)
    }

    return result.data as any
}

export const parseQuery = (qry: Request['query']): findAllQueryConfig | never => {
    const result = findAllQueryParams.partial().safeParse(qry)

    if (!result.success) {
        throw new BadRequestError(result.error.message)
    }

    return result.data
}

