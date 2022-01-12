const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()
const { MONGO_ID, MONGO_PASSWORD, NODE_ENV} = process.env;

const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@127.0.0.1:27017/admin`

const connect = () => {
    mongoose.connect(MONGO_URL, {
        dbName : 'sangnam',
        // useNewUrlParser: true,
        // useCreateIndex: true,
    }, (error) => {
        if (error) console.log('연결 에러', error)
        else console.log('연결 성공')
    })
}

mongoose.connection.on('error', (error) => {
    console.log('연결 에러!!', error)
})

mongoose.connection.on('disconnected', () => {
    console.error('연결 끊김. 재시도.')
    // connect()
})

module.exports = connect;