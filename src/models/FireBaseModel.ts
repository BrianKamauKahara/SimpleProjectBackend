import admin from 'firebase-admin'

import { DocumentNotFoundError, BadRequestError, ValidationError } from './Errors'
import { connectDB } from '../resources/database'
import { z, ZodError } from 'zod'

// Useful Types
export type Infer<T extends z.ZodRawShape> = z.infer<z.ZodObject<T>>

export type AtLeastOne<T> = {
    [K in keyof T]: Pick<T, K>
}[keyof T] & Partial<T>

export type DocSnapType = admin.firestore.DocumentSnapshot<admin.firestore.DocumentData, admin.firestore.DocumentData>

export type DbDocType<T extends z.ZodRawShape> = Infer<T> & {
    createdAt: admin.firestore.Timestamp,
    updatedAt: admin.firestore.Timestamp
}

export type findAllQueryConfig = {
    startDocId?: string,
    limit?: number,
    order?: 'asc' | 'desc'
}

export default class FireBaseModel<T extends z.ZodRawShape> {
    protected db: admin.firestore.Firestore | null = null

    constructor(
        public collection: string,
        public schema: z.ZodObject<T>,
    ) {
    }

    // Helper Properties
    private ref() {
        if (!this.db) {
            this.db = connectDB()
        }
        return this.db.collection(this.collection)
    }

    private format(d: DocSnapType) {
        if (!d.exists) {
            throw new DocumentNotFoundError(`Document with id ${d.id} somehow does not exist`)
        }

        return { id: d.id, ...d.data() as DbDocType<T> }
    }

    // Sensitive methods interacting directly with database with WRITE access
    private async addItem(data: Infer<T>) {
        return await this.ref().add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
    }

    private async updateItem(doc: DocSnapType, data: AtLeastOne<Infer<T>>) {
        doc.ref.update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
    }

    private async getDocOrThrow(id: string) {
        const doc = await this.ref().doc(id).get()

        if (!doc.exists) {
            throw new DocumentNotFoundError(
                `Document with id ${id} does not exist`
            )
        }
        return doc
    }

    // Actual Methods
    async findById(id: string) {
        const doc = await this.getDocOrThrow(id)

        return this.format(doc)
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

    async create(data: unknown) {
        const result = this.schema.safeParse(data)

        if (!result.success) {
            if (result.error instanceof ZodError) {
                throw new ValidationError(result.error.message)
            }

            throw result.error
        }

        const ref = await this.addItem(result.data)

        const doc = await ref.get()
        return this.format(doc)
    }

    async updateById(id: string, data: unknown) {
        const result = this.schema.partial().safeParse(data)

        if (!result.success) {
            throw new ValidationError(result.error.message)
        }

        if (!Object.keys(result.data).length) {
            throw new BadRequestError('No fields to update')
        }

        const doc = await this.getDocOrThrow(id)

        await this.updateItem(doc, result.data as AtLeastOne<Infer<T>>) // Interesting
        return this.findById(id)
    }

    async deleteById(id: string) {
        const doc = await this.getDocOrThrow(id)

        await doc.ref.delete()

        return { success: true }
    }
}



