

const mongoose = require('mongoose');

export const Team = mongoose.model("Team", {
    name: String, 
    RHManager: String, 
    techLead: String,
    members: [String] 
});