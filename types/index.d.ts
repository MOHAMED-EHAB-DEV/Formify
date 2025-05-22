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