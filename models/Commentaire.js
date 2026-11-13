const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    // Instance de l'auteur (null = écrit par le pasteur principal, visible partout)
    instance: { type: mongoose.Schema.Types.ObjectId, ref: "Instance", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
