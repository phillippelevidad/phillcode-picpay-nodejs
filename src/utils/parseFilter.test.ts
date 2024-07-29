import {
  Condition,
  Filter,
  Item,
  LogicalFilter,
  parseFilter,
} from "./parseFilter";

describe("parseFilter", () => {
  test("should return true for simple equality condition", () => {
    const filter: Condition = { age: { $eq: 25 } };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });

  test("should return false for simple equality condition", () => {
    const filter: Condition = { age: { $eq: 30 } };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(false);
  });

  test("should handle logical $or condition", () => {
    const filter: LogicalFilter = {
      $or: [{ age: { $eq: 30 } }, { name: { $eq: "John" } }],
    };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });

  test("should handle logical $and condition", () => {
    const filter: LogicalFilter = {
      $and: [{ age: { $eq: 25 } }, { name: { $eq: "John" } }],
    };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });

  test("should handle logical $not condition", () => {
    const filter: LogicalFilter = { $not: { age: { $eq: 30 } } };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });

  test("should return false for logical $not condition", () => {
    const filter: LogicalFilter = { $not: { age: { $eq: 25 } } };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(false);
  });

  test("should handle $in operator", () => {
    const filter: Condition = { age: { $in: [20, 25, 30] } };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });

  test("should handle $nin operator", () => {
    const filter: Condition = { age: { $nin: [20, 30, 35] } };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });

  test("should return false for $nin operator", () => {
    const filter: Condition = { age: { $nin: [20, 25, 35] } };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(false);
  });

  test("should throw an error for unsupported operator", () => {
    const filter = { age: { $unknown: 25 } } as any;
    const item: Item = { age: 25, name: "John" };

    expect(() => parseFilter(filter)(item)).toThrow(
      "Unsupported operator: $unknown"
    );
  });

  test("should handle nested logical conditions", () => {
    const filter: LogicalFilter = {
      $and: [
        { $or: [{ age: { $eq: 25 } }, { age: { $eq: 30 } }] },
        { name: { $eq: "John" } },
      ],
    };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });

  test("should handle complex conditions", () => {
    const filter: LogicalFilter = {
      $and: [
        { age: { $gt: 20 } },
        { age: { $lt: 30 } },
        { name: { $eq: "John" } },
        {
          $or: [{ status: { $eq: "active" } }, { status: { $eq: "pending" } }],
        },
      ],
    };
    const item: Item = { age: 25, name: "John", status: "active" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });

  test("should handle nested $not conditions", () => {
    const filter: LogicalFilter = {
      $not: {
        $or: [{ age: { $lt: 20 } }, { age: { $gt: 30 } }],
      },
    };
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });

  test("should return true if filter is null", () => {
    const filter = null;
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter as unknown as Filter)(item);
    expect(result).toBe(true);
  });

  test("should return true if filter is undefined", () => {
    const filter = undefined;
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter as unknown as Filter)(item);
    expect(result).toBe(true);
  });

  test("should return true if filter is an empty object", () => {
    const filter: Filter = {};
    const item: Item = { age: 25, name: "John" };

    const result = parseFilter(filter)(item);
    expect(result).toBe(true);
  });
});
