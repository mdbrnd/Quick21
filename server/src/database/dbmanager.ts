import sqlite3 from "sqlite3";
import { User } from "../models/user";
import path from "path";

// Groundwork generated by gpt4

class DBManager {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = path.resolve(__dirname, "../../../db/database.sqlite");
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Connected to the SQLite database.");
      this.setup();
    });
  }

  private setup(): void {
    this.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 1000
    )`);
  }

  addUser(name: string, password: string, balance: number): void {
    const sql = "INSERT INTO users (name, password, balance) VALUES (?, ?, ?)";
    this.db.run(sql, [name, password, balance], (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("A new user has been added.");
    });
  }

  getUser(id: number): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as User);
      });
    });
  }

  getUserByName(name: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM users WHERE name = ?", [name], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as User);
      });
    });
  }

  userExists(name: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT COUNT(*) as count FROM users WHERE name = ?",
        [name],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row.count > 0);
        }
      );
    });
  }

  updateUserBalance(id: number, balance: number): void {
    const sql = "UPDATE users SET balance = ? WHERE id = ?";
    this.db.run(sql, [balance, id], (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("User balance updated.");
      }
    });
  }

  closeDb(): void {
    this.db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Closed the database connection.");
    });
  }
}

export { DBManager, User };
