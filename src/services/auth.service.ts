import { getDatabase } from '../database/init';
import { User } from '../types/models';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class AuthService {
  private db = getDatabase();

  async registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<Omit<User, 'password_hash'>> {
    const userId = uuidv4();
    const passwordHash = this.hashPassword(password);

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      this.db.run(
        query,
        [userId, username, email, passwordHash, new Date().toISOString(), new Date().toISOString()],
        function (err) {
          if (err) {
            logger.error('Error registering user:', err);
            reject(err);
          } else {
            resolve({
              id: userId,
              username,
              email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      );
    });
  }

  async loginUser(email: string, password: string): Promise<any> {
    const user = await this.getUserByEmail(email);
    if (!user || !this.verifyPassword(password, user.password_hash)) {
      return null;
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    };
  }

  async getUser(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?';
      this.db.get(query, [userId], (err, row: any) => {
        if (err) {
          logger.error('Error getting user:', err);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<Omit<User, 'password_hash'> | null> {
    return new Promise((resolve, reject) => {
      const allowedFields = ['username', 'email'];
      const updateClause = allowedFields
        .filter((field) => field in updates)
        .map((field) => `${field} = ?`)
        .join(', ');

      if (!updateClause) {
        resolve(this.getUser(userId));
        return;
      }

      const values = allowedFields
        .filter((field) => field in updates)
        .map((field) => (updates as any)[field]);

      values.push(new Date().toISOString());
      values.push(userId);

      const query = `UPDATE users SET ${updateClause}, updated_at = ? WHERE id = ?`;
      this.db.run(query, values, async (err) => {
        if (err) {
          logger.error('Error updating user:', err);
          reject(err);
        } else {
          const updated = await this.getUser(userId);
          resolve(updated);
        }
      });
    });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user || !this.verifyPassword(oldPassword, user.password_hash)) {
      return false;
    }

    const newPasswordHash = this.hashPassword(newPassword);

    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?';
      this.db.run(
        query,
        [newPasswordHash, new Date().toISOString(), userId],
        (err) => {
          if (err) {
            logger.error('Error changing password:', err);
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  private async getUserById(userId: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';
      this.db.get(query, [userId], (err, row: any) => {
        if (err) {
          logger.error('Error getting user:', err);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      this.db.get(query, [email], (err, row: any) => {
        if (err) {
          logger.error('Error getting user by email:', err);
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private generateToken(userId: string, email: string): string {
    // Simplified JWT token generation
    // In production, use jsonwebtoken library
    const payload = {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}
