const admin = require('firebase-admin')

const { DocumentNotFoundError } = require('./Errors')
const { pathFor } = require('../config/paths')
const db = require(pathFor('resources', 'database'))

class BaseModel {
    static collection() {
        throw new Error('collection() not implemented')
    }

    static ref() {
        return db.collection(this.collection())
    }

    static async getDocOrThrow(id) {
        const doc = await this.ref().doc(id).get()

        if (!doc.exists) {
            throw new DocumentNotFoundError(
                `Document with id ${id} does not exist`
            )
        }
        return doc
    }

    static format(d) {
        return { id: d.id, ...d.data() }
    }

    static async findAll({ startDocId, limit = 10, asc = false } = {}) {
        let query = this.ref()
            .orderBy('createdAt', asc ? 'asc' : 'desc')
            .limit(limit)

        if (startDocId) {
            const startDocSnap = await this.getDocOrThrow(startDocId)
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
        const doc = await this.getDocOrThrow(id)

        return this.format(doc)
    }

    static async updateById(id, data) {
        if (typeof this.validate === 'function') {
            await this.validate(data, { all: false })
        }

        const doc = await this.getDocOrThrow(id)

        const toUpdate = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined))
        await doc.ref.update({
            ...toUpdate,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })

        return this.findById(id)
    }

    static async deleteById(id) {
        const doc = await this.getDocOrThrow(id)

        await doc.ref.delete()

        return { ack: 'data deleted successfully' }
    }
}

module.exports = BaseModel
