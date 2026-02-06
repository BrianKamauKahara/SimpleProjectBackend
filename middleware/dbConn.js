// // ---- CONNECT TO DATABASE
let firestoreReady = false
const connect = async () => {
    if (firestoreReady) return

    try {
        await db.collection('notes').limit(1).get()
        firestoreReady = true
        console.log('Firestore Ready (cached)')
    } catch (err) {
        console.error('Firestore Initialization Error: ', err)
        throw err
    }
}

const connectDB = async (req, res, next) => {
  try {
    await connect()
    next()
  } catch {
    res.status(503).json({ error: 'Database unavailable' })
  }
}

module.exports = connectDB