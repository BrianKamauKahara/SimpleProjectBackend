import admin from 'firebase-admin'

const cred = process.env.FIREBASE_CRED

if (!cred) throw new Error('DB credentials missing')

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(cred))
})

const db = admin.firestore()

export default db 