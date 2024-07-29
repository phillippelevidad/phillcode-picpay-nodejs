import { BadRequestError } from "framework/errors/BadRequestError";
import { Entity } from "utils/Entity";
import { SomePartial } from "utils/SomePartial";

export type NotificationDto = {
  id: number;
  userId: number;
  message: string;
  date: Date;
};

export type NewNotificationDto = SomePartial<NotificationDto, "id" | "date">;

export class Notification implements Entity {
  private _id!: number;
  private _userId!: number;
  private _message!: string;
  private _date!: Date;

  constructor({
    id = 0,
    userId,
    message,
    date = new Date(),
  }: NewNotificationDto) {
    this.id = id;
    this.userId = userId;
    this.message = message;
    this.date = date;
  }

  get id(): number {
    return this._id;
  }
  set id(value: number) {
    this._id = value;
  }

  get userId(): number {
    return this._userId;
  }
  set userId(value: number) {
    if (!value) {
      throw new BadRequestError("User ID is required");
    }
    this._userId = value;
  }

  get message(): string {
    return this._message;
  }
  set message(value: string) {
    if (!value || value.trim() === "") {
      throw new BadRequestError("Message is required");
    }
    this._message = value;
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

  toDto(): NotificationDto {
    return {
      id: this.id,
      userId: this.userId,
      message: this.message,
      date: this.date,
    };
  }

  static fromDto(dto: NotificationDto): Notification {
    return new Notification(dto);
  }
}
