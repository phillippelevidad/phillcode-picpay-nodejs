import { IncomingMessage, ServerResponse } from "http";
import { TransfersService } from "./TransfersService";

export class TransfersController {
  static async transfer(req: IncomingMessage, res: ServerResponse) {
    const { payer, payee, value } = req.body;
    await TransfersService.transfer(payer, payee, value);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Transfer successful" }));
  }
}
