const admin = require('firebase-admin')
const servKey = require('../serviceAccountKey')

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CRED))
})


const db = admin.firestore()

module.exports = db 