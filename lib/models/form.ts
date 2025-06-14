import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  id: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["text", "multiple-choice"],
    required: true,
  },
  label: { type: String, required: true },
  options: [String],
});

const ResponseSchema = new mongoose.Schema({
  submittedAt: { type: Date, default: Date.now },
  id: { type: String, required: true, unique: true },
  answers: [
    {
      questionId: { type: String, required: true },
      answer: String,
    },
  ],
});

const FormSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    questions: [QuestionSchema],
    responses: [ResponseSchema],
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Form || mongoose.model("Form", FormSchema);
