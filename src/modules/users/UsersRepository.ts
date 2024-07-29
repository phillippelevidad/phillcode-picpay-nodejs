import { Database } from "utils/Database";
import { Filter } from "utils/parseFilter";
import { User } from "./User";

export class UsersRepository {
  static find(query: Filter) {
    return Database.default.find<User>("users", query);
  }

  static create(user: User) {
    return Database.default.insert("users", user);
  }

  static update(query: Filter, updates: Partial<User>) {
    return Database.default.update("users", query, updates);
  }
}
