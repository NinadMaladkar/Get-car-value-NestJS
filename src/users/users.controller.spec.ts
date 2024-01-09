import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';


describe('UsersController', () => {
  let controller: UsersController;

  let fakeAuthService: Partial<AuthService>;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeAuthService = {
      // signup: () => { },
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User)
      },
    };
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({ id, email: 'test@gmail.com', password: 'testing' } as User)
      },
      find: (email: string) => {
        return Promise.resolve([ { id: 1345, email, password: 'password' } as User ])
      },
      // remove: () => { },
      // update: () => { }
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ UsersController ],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with provided email', async () => {
    const users = await controller.findAllUsers('test@gmail.com');

    expect(users.length).not.toBeNull();
    expect(users[ 0 ].email).toEqual('test@gmail.com');

  });

  it('findUser method returns a user if provided id exists', async () => {
    const user = await controller.findUser('1345');

    expect(user).toBeDefined();
  });

  it('findUser method returns an error if wrong id is provided', (done) => {
    fakeUsersService.findOne = () => null;

    controller.findUser('2')
      .then()
      .catch(() => done())
  });

  it('SignIn updates session object and returns a user', async () => {
    const session = { userId: -1 };

    const user = await controller.signin({ email: 'test@asdf.com', password: '12345' }, session)

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1)
  });

  it('Remove userId from session object on signOut', async () => {
    const session = { userId: 10 };

    controller.signOut(session);

    expect(session.userId).toBeNull()
  })
});
