import { MyExpress } from "framework/MyExpress";
import { Database } from "utils/Database";
import { Wallet } from "./Wallet";
import { WalletsController } from "./WalletsController";

export class WalletsModule {
  static register(app: MyExpress) {
    app.put("/wallets/:userId/credit", WalletsController.addCredit);

    const db = Database.default;
    db.registerEntityConstructor("wallets", Wallet);
  }
}
