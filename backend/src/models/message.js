// import mongoose from "mongoose";
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: false,
      trim: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        fileType: String,
        size: Number,
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
