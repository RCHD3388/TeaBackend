import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLoggerService } from '../../custom_logger/logger.service';
import { User } from './schemas/user.schema';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly logger: CustomLoggerService
  ) {}

  async seed() {
    await this.seedUsers();
    // Add other seeding methods here
  }

  private async seedUsers() {
    this.logger.log('Seeding users...');
    const users = [
      {
        email: 'admin@example.com',
        password: 'hashedPassword123', // In production, use proper password hashing
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
      },
      {
        email: 'user@example.com',
        password: 'hashedPassword456',
        name: 'Regular User',
        role: 'user',
        createdAt: new Date(),
      },
    ];

    try {
      await this.userModel.deleteMany({}); // Clear existing users
      await this.userModel.insertMany(users);
      this.logger.log('Users seeded successfully');
    } catch (error) {
      this.logger.error('Error seeding users', error.stack);
      throw error;
    }
  }
}
