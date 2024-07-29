import { NotFoundError } from "framework/errors/NotFoundError";
import { UsersService } from "modules/users/UsersService";
import { Wallet } from "./Wallet";
import { WalletsRepository } from "./WalletsRepository";

export class WalletsService {
  static async getWallet(userId: number) {
    const wallet = (await WalletsRepository.find({ userId }))?.[0];
    if (wallet) {
      return wallet;
    }
    const user = await UsersService.getUser(userId);
    console.log("user", user);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return await WalletsRepository.create(new Wallet({ userId }));
  }

  static async credit(userId: number, amount: number) {
    const wallet = await this.getWallet(userId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }
    wallet.credit(amount);
    await WalletsRepository.update({ userId }, wallet.toDto());
    return wallet;
  }

  static async debit(userId: number, amount: number) {
    const wallet = await this.getWallet(userId);
    wallet.debit(amount);
    await WalletsRepository.update({ userId }, wallet.toDto());
    return wallet;
  }
}
