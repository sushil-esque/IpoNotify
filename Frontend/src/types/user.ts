export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  role: "admin" | "user";
}