import { Database } from "utils/Database";
import { Filter } from "utils/parseFilter";
import { Notification } from "./Notification";

export class NotificationsRepository {
  static find(query: Filter) {
    return Database.default.find<Notification>("notifications", query);
  }

  static create(notification: Notification) {
    return Database.default.insert("notifications", notification);
  }

  static update(query: Filter, updates: Partial<Notification>) {
    return Database.default.update("notifications", query, updates);
  }
}
