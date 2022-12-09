

const mongoose = require('mongoose');

export const Task = mongoose.model("Task", {
    name: String!, 
    status: String,
    assigns: [String],
    github_url: String
});