import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants';
import bcrypt from 'bcrypt';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (user) {
      const err = createHttpError(400, 'Email already exists!');
      throw err;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    try {
      const createdUser = await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
      return createdUser;
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to store the data in the database',
      );
      throw error;
    }
  }

  /**
   * This method finds the user if it exists
   *
   * @param email Entered email by the user
   * @returns True if user exists
   */
  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  /**
   * This method finds the user if it exists using Id
   *
   * @param id user id
   * @returns True if user exists
   */
  async findById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }
}
