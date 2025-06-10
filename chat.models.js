const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
 query: {
    type: String,
    required: true
 }
}, {timestamps: true});

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = {Chat}
