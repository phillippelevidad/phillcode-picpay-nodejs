import { MyExpress } from "framework/MyExpress";
import { Database } from "utils/Database";
import { Logger } from "utils/Logger";
import { Transfer } from "./Transfer";
import { TransfersController } from "./TransfersController";

export class TransfersModule {
  private static logger: Logger = new Logger(TransfersModule.name);

  static register(app: MyExpress): void {
    app.post("/transfers", TransfersController.transfer);

    const db = Database.default;
    db.registerEntityConstructor("transfers", Transfer);

    TransfersModule.logger.debug("Transfers module registered");
  }
}
