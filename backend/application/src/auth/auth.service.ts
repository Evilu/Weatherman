import {Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {
    }

    async validateUser(email: string, pass: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) return null;
        const valid = await bcrypt.compare(pass, user.password);
        if (!valid) return null;
        const {password, ...rest} = user as any;
        return rest;
    }

    async login(user: any) {
        const payload = {sub: user.id, email: user.email, createdAt: user.createdAt};
        return {access_token: this.jwtService.sign(payload), user: payload};
    }

    async register(data: { email: string; name: string; password: string }) {
        const existing = await this.usersService.findByEmail(data.email);
        if (existing) {
            throw new UnauthorizedException('Email already in use');
        }
        const hashed = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.createUser({email: data.email, name: data.name, password: hashed});
        const {password, ...rest} = user as any;
        return rest;
    }
}

