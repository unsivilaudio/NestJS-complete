import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
    let controller: UsersController;
    let fakeUsersService: Partial<UsersService>;
    let fakeAuthService: Partial<AuthService>;

    beforeEach(async () => {
        fakeUsersService = {
            findOne: (id: number) =>
                Promise.resolve({
                    id,
                    email: 'asdf@asdf.com',
                    password: 'asdf',
                } as User),
            find: (email: string) =>
                Promise.resolve([{ id: 1, email, password: 'asdf' } as User]),
            // remove: () => Promise.resolve(),
            // update: () => Promise.resolve()
        };
        fakeAuthService = {
            // signup: () => Promise.resolve({}),
            signin: (email: string, password: string) =>
                Promise.resolve({ id: 1, email, password } as User),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: fakeUsersService,
                },
                {
                    provide: AuthService,
                    useValue: fakeAuthService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('findAllUsers returns a list of users with the give email', async () => {
        const users = await controller.findAllUsers('asdf@asdf.com');

        expect(users.length).toEqual(1);
        expect(users[0].email).toEqual('asdf@asdf.com');
    });

    it('findUser returns a user with a valid id', async () => {
        const user = await controller.findUser('1');

        expect(user).toBeDefined();
    });

    it('findUser throws an error when invalid id is supplied', async () => {
        fakeUsersService.findOne = () => null;

        await expect(controller.findUser('123')).rejects.toThrow(
            NotFoundException
        );
    });

    it('signin updates session object and returns user', async () => {
        let session = { userId: null };
        const user = await controller.signIn(
            { email: 'asdf@asdf.com', password: 'password' },
            session
        );

        expect(user.id).toEqual(1);
        expect(session.userId).toEqual(1);
    });
});
