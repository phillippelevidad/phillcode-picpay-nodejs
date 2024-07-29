import { Database } from "utils/Database";
import { Filter } from "utils/parseFilter";
import { Transfer } from "./Transfer";

export class TransfersRepository {
  static find(query: Filter) {
    return Database.default.find<Transfer>("transfers", query);
  }

  static create(transfer: Transfer) {
    return Database.default.insert("transfers", transfer);
  }

  static update(query: Filter, updates: Partial<Transfer>) {
    return Database.default.update("transfers", query, updates);
  }
}
