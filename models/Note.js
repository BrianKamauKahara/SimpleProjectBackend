const BaseModel = require('./BaseModel')
const { BadRequestError, ValidationError } = require('./Errors')

class Note extends BaseModel {
    static collection() {
        return 'notes'
    }

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