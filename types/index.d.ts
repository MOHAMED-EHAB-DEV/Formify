declare type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

declare type IUser = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: String;
  createdAt: Date;
  verified: Boolean;
};

declare type QuestionInput = {
  _id?: string;
  type: "text" | "multiple-choice";
  label: string;
  options?: string[];
};

declare type Question = {
  _id: mongoose.Types.ObjectId,
  type: "text" | "multiple-choice",
  label: String,
  options: [String]
}

declare type Response = {
  submittedAt: Date,
  answers: [
    {
      questionId: mongoose.Types.ObjectId,
      answer: String
    }
  ]
}

declare type Form = {
  title: String,
  description: String,
  questions: [Question],
  responses: [Response],
  creatorId: mongoose.Types.ObjectId,
  status: String,
  createdAt: Date,
  updatedAt: Date,
}