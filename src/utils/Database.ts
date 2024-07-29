import { promises as fs } from 'fs';
import { Entity, EntityConstructor } from './Entity';
import { Logger } from './Logger';
import { Filter, parseFilter } from './parseFilter';
import { SimpleMutex } from './SimpleMutex';

interface DatabaseData {
  data: Record<string, Record<string, unknown>[]>;
  idCounters: Record<string, number>;
}

export class Database {
  private static instance: Database;

  private readonly logger: Logger = new Logger(Database.name);
  private readonly filePath: string;
  private readonly mutex: SimpleMutex;
  private readonly entityConstructors: Record<
    string,
    EntityConstructor<Entity>
  > = {};

  private data: Record<string, Record<string, unknown>[]>;
  private idCounters: Record<string, number>;
  private initializationPromise: Promise<void>;

  private constructor(filePath: string = "./database.json") {
    this.filePath = filePath;
    this.data = {};
    this.mutex = new SimpleMutex();
    this.idCounters = {};
    this.initializationPromise = this.initializeDatabase();
  }

  public static get default(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async ensureInitialized(): Promise<void> {
    await this.initializationPromise;
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await fs.access(this.filePath);
      const dbData = await this.loadDatabase();
      this.data = dbData.data;
      this.idCounters = dbData.idCounters ?? {};
    } catch (error) {
      this.logger.debug(
        "Database file does not exist. Initializing with empty data."
      );
      await this.saveDatabase();
    }
  }

  private async loadDatabase(): Promise<DatabaseData> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      this.logger.debug("Database loaded successfully.");
      return JSON.parse(data);
    } catch (error) {
      this.logger.error(`Failed to load database: ${error}`);
      return { data: {}, idCounters: {} };
    }
  }

  private async saveDatabase(): Promise<void> {
    try {
      const dbData: DatabaseData = {
        data: this.data,
        idCounters: this.idCounters,
      };
      await fs.writeFile(this.filePath, JSON.stringify(dbData, null, 2));
      this.logger.debug("Database saved successfully.");
    } catch (error) {
      this.logger.error(`Failed to save database: ${error}`);
    }
  }

  public registerEntityConstructor<T extends Entity>(
    collection: string,
    constructor: EntityConstructor<T>
  ): void {
    this.entityConstructors[collection] =
      constructor as EntityConstructor<Entity>;
  }

  public async find<T extends Entity = Entity>(
    collection: string,
    query: Filter
  ): Promise<T[]> {
    await this.ensureInitialized();
    try {
      const filterFunction = parseFilter(query);
      const results = this.data[collection]?.filter(filterFunction) || [];
      this.logger.debug(
        `Found ${results.length} items in ${collection} matching query.`
      );
      return results.map((dto) =>
        this.deserializeEntity<T>(collection, dto)
      ) as T[];
    } catch (error) {
      this.logger.error(`Failed to find items in ${collection}: ${error}`);
      throw error;
    }
  }

  public async insert<T extends Entity = Entity>(
    collection: string,
    item: T
  ): Promise<T> {
    return this.mutex.runExclusive(async () => {
      await this.ensureInitialized();
      try {
        if (!this.data[collection]) {
          this.data[collection] = [];
          this.idCounters[collection] = 1;
        }
        item.id = this.idCounters[collection]++;
        this.data[collection].push(item.toDto());
        await this.saveDatabase();
        this.logger.debug(
          `Inserted item with ID ${item.id} into ${collection}.`
        );
        return item;
      } catch (error) {
        this.logger.error(`Failed to insert item into ${collection}: ${error}`);
        throw error;
      }
    });
  }

  public async update<T extends Entity = Entity>(
    collection: string,
    query: any,
    updates: Partial<T>
  ): Promise<T[]> {
    return this.mutex.runExclusive(async () => {
      await this.ensureInitialized();
      try {
        const items = this.data[collection]?.filter(parseFilter(query)) || [];
        items.forEach((item) => {
          Object.assign(item, updates);
        });
        await this.saveDatabase();
        this.logger.debug(`Updated ${items.length} items in ${collection}.`);
        return items.map((dto) =>
          this.deserializeEntity<T>(collection, dto)
        ) as T[];
      } catch (error) {
        this.logger.error(`Failed to update items in ${collection}: ${error}`);
        throw error;
      }
    });
  }

  public async delete(collection: string, query: any): Promise<number> {
    return this.mutex.runExclusive(async () => {
      await this.ensureInitialized();
      try {
        const initialLength = this.data[collection]?.length || 0;
        this.data[collection] =
          this.data[collection]?.filter((item) => !parseFilter(query)(item)) ||
          [];
        const deletedCount = initialLength - this.data[collection].length;
        await this.saveDatabase();
        this.logger.debug(`Deleted ${deletedCount} items from ${collection}.`);
        return deletedCount;
      } catch (error) {
        this.logger.error(
          `Failed to delete items from ${collection}: ${error}`
        );
        throw error;
      }
    });
  }

  private deserializeEntity<T extends Entity>(
    collection: string,
    dto: Record<string, unknown>
  ): T {
    const constructor = this.entityConstructors[
      collection
    ] as EntityConstructor<T>;
    if (!constructor) {
      throw new Error(
        `No constructor registered for collection: ${collection}`
      );
    }
    return constructor.fromDto(dto);
  }
}
