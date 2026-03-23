import admin from 'firebase-admin'

import { DocumentNotFoundError, BadRequestError, ValidationError } from './Errors'
import db from '../resources/database'
import { z } from 'zod'

interface findAllQueryConfig {
    startDocId?: string,
    limit?: number
    order?: 'asc' | 'desc'
}

export default class FireBaseModel<T extends z.ZodRawShape> {
    constructor(
        public collection: string,
        public schema: z.ZodObject<T>
    ) { }

    // Properties to save, update, delete, format et, cetera
    ref() {
        return db.collection(this.collection)
    }

    async getDocOrThrow(id: string) {
        const doc = await this.ref().doc(id).get()

        if (!doc.exists) {
            throw new DocumentNotFoundError(
                `Document with id ${id} does not exist`
            )
        }
        return doc
    }

    format(d: admin.firestore.DocumentSnapshot) {
        return { id: d.id, ...d.data() }
    }

    async findAll(qry: findAllQueryConfig) {
        const { order = 'asc', limit = 10, startDocId } = qry

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

    async create(data: T) {
        const ref = await this.ref().add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })

        const doc = await ref.get()
        return this.format(doc)
    }

    async findById(id: string) {
        const doc = await this.getDocOrThrow(id)

        return this.format(doc)
    }

    async updateById(id: string, data: T) {
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

    async deleteById(id) {
        const doc = await this.getDocOrThrow(id)

        await doc.ref.delete()

        return { ack: 'data deleted successfully' }
    }
}



