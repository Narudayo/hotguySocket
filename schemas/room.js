const mongoose = require('mongoose')

const { Schema } = mongoose

const roomSchema = new Schema({
    title: {    // 제목
        type: String,
        required: true
    },
    owner: {    // 방장 이름
        type: String,
        required: true
    },
    password: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('room', roomSchema)