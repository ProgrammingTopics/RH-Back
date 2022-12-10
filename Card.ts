const mongoose = require('mongoose');

export const Card = mongoose.model("Card", {
    id: String,
    name: String, 
});