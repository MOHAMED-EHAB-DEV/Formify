// models/Form.ts
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
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
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: String,
    },
  ],
});

const FormSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    questions: [QuestionSchema],
    responses: [ResponseSchema],
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Form || mongoose.model("Form", FormSchema);
