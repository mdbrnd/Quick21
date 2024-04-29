export interface User {
  id: number;
  name: string;
  password: string; // Stored as a hashed password
  balance: number;
}
