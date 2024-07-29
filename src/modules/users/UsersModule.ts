import { MyExpress } from "framework/MyExpress";
import { Database } from "utils/Database";
import { Logger } from "utils/Logger";
import { User } from "./User";
import { UsersController } from "./UsersController";

export class UsersModule {
  private static logger: Logger = new Logger(UsersModule.name);

  static register(app: MyExpress): void {
    app.post("/users", UsersController.register);

    const db = Database.default;
    db.registerEntityConstructor("users", User);

    UsersModule.logger.debug("Users module registered");
  }
}
