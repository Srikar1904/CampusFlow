const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
  {
    odId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OD",
      required: true,
    },

    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    approverRole: {
      type: String,
      enum: ["faculty", "coordinator", "hod", "director", "admin"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Approval", approvalSchema);