const BaseModel = require('./BaseModel')

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
            else throw { code: 'bad-request', message: 'Nothing to update'}
        }
    }

    static validateTitle(title) {
        if (!title || typeof title !== 'string') {
            throw { code: 'bad-request', message: `Title must be a non-empty string` }
        }
    }

    static validateContent(content) {
        if (!content || typeof content !== 'string') {
            throw { code: 'bad-request', message: `Content must be a non-empty string` }
        }
    }
}

module.exports = Note