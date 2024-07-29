import { MyExpress } from "framework/MyExpress";
import { Database } from "utils/Database";
import { Notification } from "./Notification";

export class NotificationsModule {
  static register(_: MyExpress) {
    const db = Database.default;
    db.registerEntityConstructor("notifications", Notification);
  }
}
