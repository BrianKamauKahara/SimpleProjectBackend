import dotenv from 'dotenv'
dotenv.config({ quiet: true })
import admin from 'firebase-admin'

let db: admin.firestore.Firestore | null

export const connectDB = (): admin.firestore.Firestore | never => {
  if (db) return db

  const cred = process.env.FIREBASE_CRED

  if (!cred) throw new Error('DB credentials missing')
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(cred))
  })

  db = admin.firestore()

  return db
}
