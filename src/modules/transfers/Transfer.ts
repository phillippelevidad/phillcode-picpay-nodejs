import { BadRequestError } from "framework/errors/BadRequestError";
import { Entity } from "utils/Entity";
import { SomePartial } from "utils/SomePartial";

export type TransferDto = {
  id: number;
  payerId: number;
  payeeId: number;
  amount: number;
  date: Date;
};

export type NewTransferDto = SomePartial<TransferDto, "id" | "date">;

export class Transfer implements Entity {
  private _id!: number;
  private _payerId!: number;
  private _payeeId!: number;
  private _amount!: number;
  private _date!: Date;

  constructor({
    id = 0,
    payerId,
    payeeId,
    amount,
    date = new Date(),
  }: NewTransferDto) {
    this.id = id;
    this.payerId = payerId;
    this.payeeId = payeeId;
    this.amount = amount;
    this.date = date;
  }

  get id(): number {
    return this._id;
  }
  set id(value: number) {
    this._id = value;
  }

  get payerId(): number {
    return this._payerId;
  }
  set payerId(value: number) {
    if (!value) {
      throw new BadRequestError("Payer ID is required");
    }
    this._payerId = value;
  }

  get payeeId(): number {
    return this._payeeId;
  }
  set payeeId(value: number) {
    if (!value) {
      throw new BadRequestError("Payee ID is required");
    }
    this._payeeId = value;
  }

  get amount(): number {
    return this._amount;
  }
  set amount(value: number) {
    if (value <= 0) {
      throw new BadRequestError("Amount must be greater than zero");
    }
    this._amount = value;
  }

  get date(): Date {
    return this._date;
  }
  set date(value: Date) {
    if (!(value instanceof Date)) {
      throw new BadRequestError("Invalid date format");
    }
    this._date = value;
  }

  toDto(): TransferDto {
    return {
      id: this.id,
      payerId: this.payerId,
      payeeId: this.payeeId,
      amount: this.amount,
      date: this.date,
    };
  }

  static fromDto(dto: TransferDto): Transfer {
    return new Transfer(dto);
  }
}
