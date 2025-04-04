import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/users/entities/role.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default class AdminUserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    // Get repositories
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Get admin email and password from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(
        'ADMIN_EMAIL or ADMIN_PASSWORD is not defined in the environment variables.',
      );
      throw new Error(
        'Missing required environment variables: ADMIN_EMAIL or ADMIN_PASSWORD',
      );
    }

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists, skipping seed');
      return;
    }

    // Get or create admin role
    let adminRole = await roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      adminRole = roleRepository.create({
        name: 'admin',
        description: 'System administrator',
      });
      adminRole = await roleRepository.save(adminRole);
    }

    // Create admin user with the same hashing method as register
    const hashedPassword = await bcrypt.hash(adminPassword, 10); // Using salt rounds 10, same as in AuthService

    const adminUser = userRepository.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      emailVerified: true,
      roles: [adminRole],
    });

    try {
      await userRepository.save(adminUser);
      console.log('Admin user created successfully');
    } catch (error) {
      console.error('Failed to create admin user:', error);
      throw error;
    }
  }
}
