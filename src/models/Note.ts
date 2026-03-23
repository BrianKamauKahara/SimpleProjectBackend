import FireBaseModel from './BaseModel'
import { z } from 'zod'

const noteSchema = z.object({
    title: z.string().min(1, { error: 'Title must be a non-empty string' }),
    content: z.string().min(1, { error: 'Content must be a non-empty string' }),
})

export const Note = new FireBaseModel('notes', noteSchema)

/* 

import BaseModel from './BaseModel'
const { BadRequestError, ValidationError } = require('./Errors')
import * as z from 'zod'

class Note extends BaseModel {
    static collection() {
        return 'notes'
    }

    static schema = z.object({
        title: z.string().min(1, {error: 'Title must be a non-empty string'}),
        content: z.string().min(1, { error: 'Content must be a non-empty string' }),
    })

    static async validate({ title, content }, { all } = {}) {
        if (all) {
            this.validateTitle(title)
            this.validateContent(content)
        } else {
            if (title !== undefined) this.validateTitle(title)
            else if (content !== undefined) this.validateContent(content)
            else throw new BadRequestError('Nothing to Update')
        }
    }

    static validateTitle(title) {
        if (!title || typeof title !== 'string') {
            throw new ValidationError('Title must be a non-empty string')
        }
    }

    static validateContent(content) {
        if (!content || typeof content !== 'string') {
            throw new ValidationError('Content must be a non-empty string')
        }
    }
}

module.exports = Note
*/