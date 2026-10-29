const mongoose = require("mongoose");

const blackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: [true, "Token must be unique"],
    }
  },
  { timestamps: true },
);

blackListSchema.index({createdAt: 1}, {expireAfterSeconds: 60 * 60 * 24})

const blackListModel = mongoose.model("blacklist", blackListSchema);

module.exports = blackListModel;
