import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const MONGODB_URL = process.env.MONGODB_URL

const dropIndex = async () => {
    try {
        await mongoose.connect(MONGODB_URL)
        console.log('Connected to MongoDB')

        await mongoose.connection.collection('users').dropIndex('useName_1')
        console.log('Index useName_1 dropped successfully!')

        await mongoose.disconnect()
        process.exit(0)
    } catch (error) {
        console.log('Error:', error)
        process.exit(1)
    }
}

dropIndex()