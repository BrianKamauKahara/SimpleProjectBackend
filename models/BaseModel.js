const admin = require('firebase-admin')
const { pathFor } = require('../config/paths')
const db = require(pathFor('resources', 'database'))

class DocumentNotFoundError extends Error {
    constructor(message) {
        super(message)
        this.name = 'DocumentNotFoundError'
        this.code = 'not-found'
        Error.captureStackTrace(this, this.constructor)
    }
}

class BaseModel {
    static collection() {
        throw new Error('collection() not implemented')
    }

    static ref() {
        return db.collection(this.collection())
    }

    getDoc(id) {
        return this.constructor.ref().doc(id)
    }

    static format(d) {
        return { id: d.id, ...d.data() }
    }

    static async findAll({ startDocId, limit = 10, asc = false } = {}) {
        let query = this.ref().orderBy('createdAt', asc ? 'asc' : 'desc').limit(limit)

        if (startDocId) {
            const startDocSnap = await this.ref().doc(startDocId).get()
            if (!startDocSnap.exists) {
                throw new DocumentNotFoundError(
                    `Document with id ${startDocId} does not exist`
                )
            }
            query = query.startAfter(startDocSnap)
        }

        const snap = await query.get()
        return snap.docs.map(d => this.format(d))
    }

    static async create(data) {
        if (typeof this.validate === 'function') {
            await this.validate(data, { all: true })
        }

        const ref = await this.ref().add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })

        const doc = await ref.get()
        return this.format(doc)
    }

    static async findById(id) {
        const doc = await this.ref().doc(id).get()
        if (!doc.exists) {
            throw new DocumentNotFoundError(
                `Document with id ${id} does not exist`
            )
        }
        return this.format(doc)
    }

    static async updateById(id, data) {
        console.log(data)
        if (typeof this.validate === 'function') {
            await this.validate(data, { all: false })
        }

        await this.ref().doc(id).update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
        return this.findById(id)
    }

    static async deleteById(id) {
        const docRef = this.ref().doc(id)
        const doc = await docRef.get()

        if (!doc.exists) {
            throw new DocumentNotFoundError(
                `Document with id ${id} does not exist`
            )
        }

        await docRef.delete()
        return { ack: 'data deleted successfully' }
    }
}

module.exports = BaseModel
