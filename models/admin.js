const mongoose = require("mongoose");

const AdminSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("admin", AdminSchema);
