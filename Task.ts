const mongoose = require("mongoose");

export const Task = mongoose.model("Task", {
  name: String!,
  description: String,
  status: String,
  assigns: String,
  githubUrl: String,
});
