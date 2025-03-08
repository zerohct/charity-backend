/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/services/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Nếu chắc chắn JWT_SECRET luôn tồn tại, bạn có thể dùng '!'
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // payload: { sub: number; email: string }
  async validate(payload: any) {
    // Bạn có thể khai báo payload rõ ràng hơn:
    // async validate(payload: { sub: number; email: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }
    const { password, ...result } = user;
    return result;
  }
}
