import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = []
    usersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email)
        return Promise.resolve(filteredUsers)
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 999999), email, password } as User;
        users.push(user)

        return Promise.resolve(user)
      }
    }
    const module = await Test.createTestingModule({
      providers: [ AuthService, {
        provide: UsersService,
        useValue: usersService
      } ]
    }).compile();

    service = module.get(AuthService);
  })

  it('can create instance of auth service', async () => {
    expect(service).toBeDefined()
  })

  it('creates a new user with a salted & hashed password', async () => {
    const user = await service.signup('testmail@gmail.com', 'password123');

    expect(user.password).not.toEqual('password123')
    const [ salt, hash ] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();

  });

  it('throws an error if user already exists on signup', async () => {
    await service.signup('test@test.com', 'test123')
    try {
      const user = await service.signup('test@test.com', 'test123')
      expect(user).toThrowError('Email already in use')
    } catch (error) {

    }
  });

  it('throws error if no user found on sign in', async () => {
    try {
      const user = await service.signin('test234@gmwer.com', '1234453')
      expect(user).toBe([])
    } catch (error) {

    }
  });

  it('throws error if invalid password is provided', async () => {
    await service.signup('test@gmail.com', 'test123')

    const user = service.signin('test@gmail.com', '12345')
    expect(user).rejects.toThrow('Bad password');

  });

  it('Returns a user when correct password is provided', async () => {
    await service.signup('test123@test.com', 'test123')

    const user = await service.signin('test123@test.com', 'test123')

    expect(user).toBeDefined()
  });
});

