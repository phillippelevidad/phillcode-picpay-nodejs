import { Database } from "utils/Database";
import { Filter } from "utils/parseFilter";
import { Wallet } from "./Wallet";

export class WalletsRepository {
  static find(query: Filter) {
    return Database.default.find<Wallet>("wallets", query);
  }

  static create(wallet: Wallet) {
    return Database.default.insert("wallets", wallet);
  }

  static update(query: Filter, updates: Partial<Wallet>) {
    return Database.default.update("wallets", query, updates);
  }
}
