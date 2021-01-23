const mongoose = require('mongoose')

const TopicSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Topic', TopicSchema)