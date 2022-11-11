

const mongoose = require('mongoose');

export const User = mongoose.model("User", { email: String, password: String });