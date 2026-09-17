import { UserRepository } from '../repositories/user.repository.js';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/user.js';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  public getAllUsers(): User[] {
    return this.userRepository.findAll();
  }

  public getUserById(id: string): User {
    const user = this.userRepository.findById(id);
    if (!user) {
      const error = new Error(`User with ID '${id}' not found`);
      (error as any).statusCode = 404;
      throw error;
    }
    return user;
  }

  public createUser(dto: CreateUserDTO): User {
    const existing = this.userRepository.findByEmail(dto.email);
    if (existing) {
      const error = new Error(`User with email '${dto.email}' already exists`);
      (error as any).statusCode = 409;
      throw error;
    }

    return this.userRepository.create(dto);
  }

  public updateUser(id: string, dto: UpdateUserDTO): User {
    // Check if user exists
    const existingUser = this.getUserById(id);

    // If changing email, check for duplicate email
    if (dto.email && dto.email.toLowerCase().trim() !== existingUser.email.toLowerCase()) {
      const emailTaken = this.userRepository.findByEmail(dto.email);
      if (emailTaken) {
        const error = new Error(`Email '${dto.email}' is already in use by another user`);
        (error as any).statusCode = 409;
        throw error;
      }
    }

    const updated = this.userRepository.update(id, dto);
    if (!updated) {
      const error = new Error(`Failed to update user with ID '${id}'`);
      (error as any).statusCode = 500;
      throw error;
    }

    return updated;
  }

  public deleteUser(id: string): void {
    // Verify user exists first
    this.getUserById(id);
    this.userRepository.delete(id);
  }
}
