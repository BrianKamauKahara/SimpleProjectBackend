import admin from 'firebase-admin'
import { z } from 'zod'

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
    limit: number,
    order: 'asc' | 'desc'
}