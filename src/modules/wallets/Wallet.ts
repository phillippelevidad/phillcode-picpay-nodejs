import { BadRequestError } from "framework/errors/BadRequestError";
import { Entity } from "utils/Entity";
import { SomePartial } from "utils/SomePartial";

export type WalletDto = {
  id: number;
  userId: number;
  balance: number;
};

export type NewWalletDto = SomePartial<WalletDto, "id" | "balance">;

export class Wallet implements Entity {
  private _id!: number;
  private _userId!: number;
  private _balance!: number;

  constructor({ id = 0, userId, balance = 0 }: NewWalletDto) {
    this.id = id;
    this.userId = userId;
    this.balance = balance;
  }

  get id(): number {
    return this._id;
  }
  set id(value: number) {
    this._id = value;
  }

  get userId() {
    return this._userId;
  }
  set userId(value) {
    if (!value) {
      throw new BadRequestError("User ID is required");
    }
    this._userId = value;
  }

  get balance() {
    return this._balance;
  }
  set balance(value) {
    if (value < 0) {
      throw new BadRequestError("Balance cannot be negative");
    }
    this._balance = value;
  }

  credit(amount: number) {
    if (amount <= 0) {
      throw new BadRequestError("Credit amount must be positive");
    }
    this.balance += amount;
  }

  debit(amount: number) {
    if (amount <= 0) {
      throw new BadRequestError("Debit amount must be positive");
    }
    if (this.balance < amount) {
      throw new BadRequestError("Insufficient balance");
    }
    this.balance -= amount;
  }

  toDto(): WalletDto {
    return {
      id: this.id,
      userId: this.userId,
      balance: this.balance,
    };
  }

  static fromDto(dto: WalletDto): Wallet {
    return new Wallet(dto);
  }
}
