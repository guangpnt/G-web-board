const mongoose = require('mongoose')

const GUserSchema = mongoose.Schema({
    googleID: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true  
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('GUser', GUserSchema)