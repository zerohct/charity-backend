import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/users/entities/role.entity';
import * as bcrypt from 'bcrypt';

export default class AdminUserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    // Get repositories
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@example.com' },
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

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = userRepository.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '0123456789',
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
