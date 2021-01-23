const mongoose = require('mongoose')

const CommentSchema = mongoose.Schema({
    topicID: {
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
    comment: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Comment', CommentSchema)