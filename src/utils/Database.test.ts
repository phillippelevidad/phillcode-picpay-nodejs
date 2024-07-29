import { promises as fs } from "fs";
import { Database } from "./Database";
import { Entity } from "./Entity";
import { Item, parseFilter } from "./parseFilter";

jest.mock("./Logger");
jest.mock("./parseFilter");
jest.mock("fs", () => {
  const originalModule = jest.requireActual("fs");
  return {
    __esModule: true,
    ...originalModule,
    promises: {
      ...originalModule.promises,
      access: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  };
});

class TestEntity implements Entity {
  public static fromDto(dto: any): TestEntity {
    return new TestEntity(dto.id, dto.name);
  }
  constructor(public id: number, public name: string) {}
  public toDto(): any {
    return { id: this.id, name: this.name };
  }
}

describe("Database", () => {
  let fileContent: string;

  const mockFs = () => {
    fileContent = "";
    (parseFilter as jest.Mock).mockImplementation(
      (query) => (item: Item) => item.id === query.id
    );
    (fs.access as jest.Mock).mockImplementation(async (path: string) => {
      if (path !== "./database.json") throw new Error("File not found");
    });
    (fs.readFile as jest.Mock).mockImplementation(async (path: string) => {
      if (path === "./database.json") return fileContent;
      throw new Error("File not found");
    });
    (fs.writeFile as jest.Mock).mockImplementation(
      async (path: string, data: string) => {
        if (path === "./database.json") fileContent = data;
      }
    );
  };

  beforeEach(async () => {
    mockFs();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    delete (Database as any).instance;
  });

  describe("Database initialization", () => {
    test("should initialize with empty data if file does not exist", async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error("File not found"));
      const database = Database.default;
      await database.ensureInitialized();
      expect(fs.access).toHaveBeenCalledWith("./database.json");
      expect(fs.writeFile).toHaveBeenCalled();
      expect(JSON.parse(fileContent)).toEqual({ data: {}, idCounters: {} });
    });

    test("should load data if file exists", async () => {
      const mockData = {
        data: { test: [{ id: 1, name: "whatever" }] },
        idCounters: { test: 2 },
      };
      fileContent = JSON.stringify(mockData);
      const database = Database.default;
      database.registerEntityConstructor("test", TestEntity);
      await database.ensureInitialized();

      expect(fs.access).toHaveBeenCalledWith("./database.json");
      expect(fs.readFile).toHaveBeenCalledWith("./database.json", "utf-8");

      const results = await database.find<TestEntity>("test", { id: 1 });
      expect(results).toHaveLength(1);
    });
  });

  describe("find", () => {
    test("should find items matching the query", async () => {
      const item = new TestEntity(0, "test");
      const database = Database.default;
      database.registerEntityConstructor("test", TestEntity);
      await database.ensureInitialized();

      await database.insert("test", item);
      const results = await database.find<TestEntity>("test", { id: 1 });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(1);
      expect(results[0].name).toBe("test");
    });
  });

  describe("insert", () => {
    test("should insert an item into the collection", async () => {
      const item = new TestEntity(0, "test");
      const database = Database.default;
      database.registerEntityConstructor("test", TestEntity);
      await database.ensureInitialized();

      const result = await database.insert("test", item);
      expect(result.id).toBe(1);

      const results = await database.find<TestEntity>("test", { id: 1 });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(1);
      expect(results[0].name).toBe("test");
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    test("should update items matching the query", async () => {
      const item = new TestEntity(0, "test");
      const database = Database.default;
      database.registerEntityConstructor("test", TestEntity);
      await database.ensureInitialized();

      await database.insert("test", item);
      const results = await database.update<TestEntity>(
        "test",
        { id: 1 },
        { name: "updated" }
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("updated");

      const foundResults = await database.find<TestEntity>("test", { id: 1 });
      expect(foundResults[0].name).toBe("updated");
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    test("should delete items matching the query", async () => {
      const item = new TestEntity(0, "test");
      const database = Database.default;
      database.registerEntityConstructor("test", TestEntity);
      await database.ensureInitialized();

      await database.insert("test", item);
      const deletedCount = await database.delete("test", { id: 1 });
      expect(deletedCount).toBe(1);

      const results = await database.find("test", {});
      expect(results).toHaveLength(0);
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });
});
