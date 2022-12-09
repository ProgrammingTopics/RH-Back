

const mongoose = require('mongoose');

export const User = mongoose.model("User", { 
    email: String, 
    password: String, 
    role: String, 
    team: String, 
    userType: Number, 
    fullName: String, 
    valuePerHour: Number, 
    hoursWorked: Number , 
    tasks: [String]
});