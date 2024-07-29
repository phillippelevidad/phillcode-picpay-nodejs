import { BadRequestError } from "framework/errors/BadRequestError";
import { NotFoundError } from "framework/errors/NotFoundError";
import { AuthorizationService } from "modules/authorization/AuthorizationService";
import { NotificationsService } from "modules/notifications/NotificationsService";
import { UsersService } from "modules/users/UsersService";
import { WalletsService } from "modules/wallets/WalletsService";
import { Logger } from "utils/Logger";
import { Transfer } from "./Transfer";
import { TransfersRepository } from "./TransfersRepository";

const ERROR_MESSAGES = {
  PAYER_NOT_FOUND: "Payer not found",
  INVALID_PAYER_TYPE: "User is not allowed to send money",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  TRANSFER_NOT_AUTHORIZED: "Transfer not authorized",
};

export class TransfersService {
  private static readonly logger: Logger = new Logger(TransfersService.name);

  static async transfer(
    payerId: number,
    payeeId: number,
    amount: number
  ): Promise<void> {
    const payer = await UsersService.getUser(payerId);
    if (!payer) {
      throw new NotFoundError(ERROR_MESSAGES.PAYER_NOT_FOUND);
    }
    if (payer.type !== "payer") {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_PAYER_TYPE);
    }

    const payerWallet = await WalletsService.getWallet(payerId);
    if (payerWallet.balance < amount) {
      throw new BadRequestError(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
    }

    const authorized = await AuthorizationService.authorize(
      payerId,
      payeeId,
      amount
    );
    if (!authorized) {
      throw new BadRequestError(ERROR_MESSAGES.TRANSFER_NOT_AUTHORIZED);
    }

    await this.performTransfer(payerId, payeeId, amount);
  }

  private static async performTransfer(
    payerId: number,
    payeeId: number,
    amount: number
  ): Promise<void> {
    let debitCompleted = false;
    let creditCompleted = false;

    try {
      await WalletsService.debit(payerId, amount);
      debitCompleted = true;

      await WalletsService.credit(payeeId, amount);
      creditCompleted = true;

      const transfer = new Transfer({
        payerId,
        payeeId,
        amount,
        date: new Date(),
      });
      await TransfersRepository.create(transfer);

      await TransfersService.notify(payeeId, amount, payerId);
    } catch (error) {
      this.logger.error(`Transfer failed: ${(error as Error).message}`);
      await this.rollback(
        debitCompleted,
        creditCompleted,
        payerId,
        payeeId,
        amount
      );
      throw error;
    }
  }

  private static async notify(
    payeeId: number,
    amount: number,
    payerId: number
  ) {
    try {
      // Would actually publish an event in the system
      // and handle sending the notification asynchronously
      // with a retry mechanism
      await NotificationsService.notify(
        payeeId,
        `You have received ${amount} from ${payerId}`
      );
    } catch (error) {
      this.logger.error(`Notification failed: ${(error as Error).message}`);
    }
  }

  private static async rollback(
    debitCompleted: boolean,
    creditCompleted: boolean,
    payerId: number,
    payeeId: number,
    amount: number
  ): Promise<void> {
    try {
      if (debitCompleted) {
        await WalletsService.credit(payerId, amount);
      }
      if (creditCompleted) {
        await WalletsService.debit(payeeId, amount);
      }
    } catch (rollbackError) {
      this.logger.error(`Rollback failed: ${(rollbackError as Error).message}`);
    }
  }
}
