import admin from 'firebase-admin'

import { DocumentNotFoundError } from './Errors'
import db from '../resources/database'

export default class FireBaseModel {
    static collection(): string | never {
        throw new Error('collection() not implemented')
    }

    static ref() {
        return db.collection(this.collection())
    }

    static async getDocOrThrow(id: string) {
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


    static async findAll(startDocId: string, limit: number = 10, order: 'asc' | 'desc' = 'desc') {
        const refme = this.ref()
        let query = this.ref()
            .orderBy('createdAt', order)
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


import * as z from 'zod'

const player = z.object({
    username: z.string(),
    xp: z.number()
})