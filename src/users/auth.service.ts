import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt)

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  async signup(email: string, password: string) {
    const users = await this.usersService.find(email)

    if (users.length) {
      throw new BadRequestException('Email already in use')
    }

    // Hash the user's password
    // Generate salt
    const salt = randomBytes(8).toString('hex')

    // Hash the salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer

    // TODO Join the hashed result and salt together
    const encryptedPassword = salt + '.' + hash.toString('hex');

    // Create a new user and save 
    const user = await this.usersService.create(email, encryptedPassword)

    // Return the user
    return user;

  }

  async signin(email: string, password: string) {
    const [ user ] = await this.usersService.find(email);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const [ salt, hash ] = user.password.split('.');

    const encryptedPassword = (await scrypt(password, salt, 32)) as Buffer;

    if (hash !== encryptedPassword.toString('hex')) { 
      throw new BadRequestException('Bad password')
    }

    return user;
  }
}