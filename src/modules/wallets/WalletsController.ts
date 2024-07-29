import { BadRequestError } from "framework/errors/BadRequestError";
import { IncomingMessage, ServerResponse } from "http";
import { WalletsService } from "./WalletsService";

export class WalletsController {
  static async addCredit(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    if (!req.params?.userId) {
      throw new BadRequestError("User ID is required");
    }

    const userId = Number(req.params.userId);
    const amount = req.body?.amount ?? 0;

    await WalletsService.credit(userId, amount);

    const wallet = await WalletsService.getWallet(userId);
    const { id, ...walletWithoutId } = wallet.toDto();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(walletWithoutId));
  }
}
