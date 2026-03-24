import admin from 'firebase-admin'

import { DocumentNotFoundError, BadRequestError, ValidationError } from './Errors'
import db from '../resources/database'
import { success, z, ZodError } from 'zod'

// Useful Types
type DocumentSnapshotDataType = admin.firestore.DocumentSnapshot<admin.firestore.DocumentData, admin.firestore.DocumentData>
type Infer<T extends z.ZodRawShape> = z.infer<z.ZodObject<T>>
interface findAllQueryConfig {
    startDocId?: string,
    limit?: number
    order?: 'asc' | 'desc'
}

export default class FireBaseModel<T extends z.ZodRawShape> {
    constructor(
        public collection: string,
        public schema: z.ZodObject<T>,
    ) { }

    // Helper Properties
    private ref() {
        return db.collection(this.collection)
    }

    private format(d: DocumentSnapshotDataType) {
        return { id: d.id, ...d.data() }
    }

    // Sensitive methods interacting directly with database with WRITE access
    private async addItem(data: Infer<T>) {
        return await this.ref().add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
    }

    private async updateItem(doc: DocumentSnapshotDataType, data: Partial<Infer<T>>) {
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

        await this.updateItem(doc, result.data as Partial<Infer<T>>) // Interesting
        return this.findById(id)
    }

    async deleteById(id: string) {
        const doc = await this.getDocOrThrow(id)

        await doc.ref.delete()

        return { success: true }
    }
}



