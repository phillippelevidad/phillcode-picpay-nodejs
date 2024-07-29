import { BadRequestError } from "framework/errors/BadRequestError";
import { User, UserDto } from "./User";
import { UsersRepository } from "./UsersRepository";

export class UsersService {
  static async getUser(userId: number) {
    return (await UsersRepository.find({ id: userId }))?.[0];
  }

  static async registerUser({
    fullName,
    cpfCnpj,
    email,
    password,
    type,
  }: UserDto) {
    const existingUser = await UsersRepository.find({
      $or: [{ cpfCnpj }, { email }],
    });
    if (existingUser.length) {
      throw new BadRequestError("CPF/CNPJ or Email already exists");
    }

    const user = new User({ fullName, cpfCnpj, email, password, type });
    return await UsersRepository.create(user);
  }
}
