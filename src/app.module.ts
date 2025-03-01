/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import các module con
import { UsersModule } from './modules/users/users.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { DonationsModule } from './modules/donations/donations.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FinancialRecordsModule } from './modules/financial-records/financial-records.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Load biến môi trường từ file .env, có thể sử dụng ở toàn bộ dự án
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Cấu hình TypeORM sử dụng các biến môi trường
    TypeOrmModule.forRoot({
      type: 'postgres', // PostgreSQL
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],

      synchronize: true,
    }),
    // Import các module con của dự án
    UsersModule,
    CampaignsModule,
    DonationsModule,
    CommentsModule,
    FinancialRecordsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
