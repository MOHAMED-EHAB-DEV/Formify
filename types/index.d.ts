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