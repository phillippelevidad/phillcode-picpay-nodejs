import crypto from "crypto";
import { BadRequestError } from "framework/errors/BadRequestError";
import { Entity } from "utils/Entity";
import { SomePartial } from "utils/SomePartial";

export type UserDto = {
  id: number;
  fullName: string;
  cpfCnpj: string;
  email: string;
  password: string;
  type: string;
};

export type NewUserDto = SomePartial<UserDto, "id">;

export class User implements Entity {
  private _id!: number;
  private _fullName!: string;
  private _cpfCnpj!: string;
  private _email!: string;
  private _password!: string;
  private _type!: string;

  constructor({
    id = 0,
    fullName,
    cpfCnpj,
    email,
    password,
    type,
  }: NewUserDto) {
    this.id = id ?? 0;
    this.fullName = fullName;
    this.cpfCnpj = cpfCnpj;
    this.email = email;
    this.password = password;
    this.type = type;
  }

  get id(): number {
    return this._id;
  }
  set id(value: number) {
    this._id = value;
  }

  get fullName(): string {
    return this._fullName;
  }
  set fullName(value: string) {
    if (!value) {
      throw new BadRequestError("Full name is required");
    }
    this._fullName = value;
  }

  get cpfCnpj(): string {
    return this._cpfCnpj;
  }
  set cpfCnpj(value: string) {
    if (!User.isValidCpfCnpj(value)) {
      throw new BadRequestError("Invalid CPF/CNPJ format");
    }
    this._cpfCnpj = value;
  }

  get email(): string {
    return this._email;
  }
  set email(value: string) {
    if (!User.isValidEmail(value)) {
      throw new BadRequestError("Invalid email format");
    }
    this._email = value;
  }

  get password(): string {
    return this._password;
  }
  set password(value: string) {
    if (!value?.trim()?.length) {
      throw new BadRequestError("Password is required");
    }
    this._password = User.hashPassword(value);
  }

  get type(): string {
    return this._type;
  }
  set type(value: string) {
    if (!value) {
      throw new BadRequestError("User type is required");
    }
    if (!User.isValidType(value)) {
      throw new BadRequestError("Invalid type; must be 'payer' or 'payee'");
    }
    this._type = value;
  }

  isValidPassword(suppliedPassword: string): boolean {
    if (!this._password || !suppliedPassword) {
      return false;
    }
    const [salt, hash] = this._password.split(":");
    const suppliedHash = crypto
      .pbkdf2Sync(suppliedPassword, salt, 100000, 64, "sha512")
      .toString("hex");
    return hash === suppliedHash;
  }

  private static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
    return `${salt}:${hash}`;
  }

  private static isValidCpfCnpj(cpfCnpj: string): boolean {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    return cpfRegex.test(cpfCnpj) || cnpjRegex.test(cpfCnpj);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidType(type: string): boolean {
    return ["payer", "payee"].includes(type);
  }

  toDto(): UserDto {
    return {
      id: this.id,
      fullName: this.fullName,
      cpfCnpj: this.cpfCnpj,
      email: this.email,
      password: this.password,
      type: this.type,
    };
  }

  static fromDto(dto: UserDto): User {
    return new User(dto);
  }
}
