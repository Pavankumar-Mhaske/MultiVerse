export interface UserInterface {
  _id: string;
  avatar: {
    url: string;
    localPath: string;
    _id: string;
  };
  username: string;
  email: string;
  contactNumber: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
