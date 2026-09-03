import { Injectable } from '../../../packages/core/src/decorators/injectable.js';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable()
export class UserService {
  private users: User[] = [
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
    { id: 2, username: 'user', email: 'user@example.com', role: 'user' },
    { id: 3, username: 'guest', email: 'guest@example.com', role: 'guest' },
  ];

  findAll(): User[] {
    return this.users;
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findByUsername(username: string): User | undefined {
    return this.users.find((u) => u.username === username);
  }

  create(user: Omit<User, 'id'>): User {
    const newUser = {
      id: this.users.length + 1,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, updates: Partial<Omit<User, 'id'>>): User | undefined {
    const user = this.findById(id);
    if (user) {
      Object.assign(user, updates);
    }
    return user;
  }

  delete(id: number): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}
