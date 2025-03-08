import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Get all roles
  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  // Find role by name
  async findByName(name: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Role "${name}" not found`);
    }
    return role;
  }

  // Find role by ID
  async findById(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    return role;
  }

  // Create a new role
  async create(name: string, description?: string): Promise<Role> {
    const role = this.rolesRepository.create({ name, description });
    return this.rolesRepository.save(role);
  }

  // Initialize default roles
  async initializeDefaultRoles(): Promise<void> {
    const count = await this.rolesRepository.count();
    if (count > 0) {
      return;
    }

    const defaultRoles = [
      { name: 'guest', description: 'Unregistered visitor' },
      { name: 'user', description: 'Registered regular user' },
      { name: 'charity', description: 'Charity organization' },
      { name: 'secretary', description: 'Administrative secretary' },
      { name: 'admin', description: 'System administrator' },
    ];

    for (const roleData of defaultRoles) {
      await this.create(roleData.name, roleData.description);
    }
  }

  // Assign role to user
  async assignRoleToUser(userId: number, roleName: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const role = await this.findByName(roleName);

    // Check if user already has this role
    const hasRole = user.roles.some((r) => r.id === role.id);
    if (!hasRole) {
      user.roles.push(role);
      return this.usersRepository.save(user);
    }

    return user;
  }

  // Remove role from user
  async removeRoleFromUser(userId: number, roleName: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const role = await this.findByName(roleName);

    user.roles = user.roles.filter((r) => r.id !== role.id);
    return this.usersRepository.save(user);
  }

  // Set roles for user (replacing all existing roles)
  async setUserRoles(userId: number, roleNames: string[]): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const roles = await Promise.all(
      roleNames.map((name) => this.findByName(name)),
    );

    user.roles = roles;
    return this.usersRepository.save(user);
  }

  // Check if user has a specific role
  async userHasRole(userId: number, roleName: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    return user.roles.some((role) => role.name === roleName);
  }
}
