import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUserService: Partial<UsersService>;
    const users: User[] = [];

    beforeEach(async () => {
        fakeUserService = {
            find: (email: string) => {
                return Promise.resolve(
                    users.filter(user => user.email === email)
                );
            },
            create: (email: string, password: string) => {
                const user = {
                    id: Math.floor(Math.random() * 9999999),
                    email,
                    password,
                } as User;
                users.push(user);
                return Promise.resolve(user);
            },
        };
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUserService,
                },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('asdf@asdf.com', 'asdf');

        expect(user.password).not.toEqual('asdf');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with existing email', async () => {
        await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
            BadRequestException
        );
    });

    it('throws if sign in is called with an invalid email', async () => {
        await expect(service.signin('test@test.com', 'asdf')).rejects.toThrow(
            NotFoundException
        );
    });

    it('throws if an invalid password is provided', async () => {
        await expect(service.signin('asdf@asdf.com', '123456')).rejects.toThrow(
            BadRequestException
        );
    });

    it('returns a user if correct password is provided', async () => {
        await service.signup('test@test.com', 'mypassword');
        const user = await service.signin('test@test.com', 'mypassword');

        expect(user).toBeDefined();
    });
});
