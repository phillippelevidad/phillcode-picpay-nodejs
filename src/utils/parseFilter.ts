export type LogicalOperator = "$or" | "$and" | "$not";
export type Operator =
  | "$eq"
  | "$ne"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$in"
  | "$nin";

type Primitive = string | number | boolean | null;

export type Condition = {
  [field: string]: { [key in Operator]?: Primitive | Primitive[] } | Primitive;
};

export interface LogicalFilter {
  $or?: Filter[];
  $and?: Filter[];
  $not?: Filter;
}

export type Filter = Condition | LogicalFilter;

export interface Item {
  [key: string]: any;
}

export function parseFilter(filter: Filter): (item: Item) => boolean {
  if (
    filter == null ||
    (typeof filter === "object" && Object.keys(filter).length === 0)
  ) {
    return () => true;
  }

  // { name: "Phill" }
  // { $or: [ { name: "Phill" }, { age: { $gt: 18 } } ] }
  return (item: Item): boolean => {
    return Object.keys(filter).every((key: string) => {
      const value = filter[key as keyof Filter];

      switch (key) {
        case "$or":
          return (value as Filter[]).some((subFilter) =>
            parseFilter(subFilter)(item)
          );

        case "$and":
          return (value as Filter[]).every((subFilter) =>
            parseFilter(subFilter)(item)
          );

        case "$not":
          return !parseFilter(value as Filter)(item);

        default:
          return applyCondition(key, value, item);
      }
    });
  };
}

// { name: "Phill" }
// { age: { $gt: 18 } }
function applyCondition(key: string, value: any, item: Item): boolean {
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value).every((operator: string) => {
      return evaluateOperator(key, operator as Operator, value[operator], item);
    });
  } else {
    return item[key] === value;
  }
}

// { $gt: 18 }
function evaluateOperator(
  key: string,
  operator: Operator,
  expectedValue: any,
  item: Item
): boolean {
  const actualValue = item[key];

  switch (operator) {
    case "$eq":
      return actualValue === expectedValue;
    case "$ne":
      return actualValue !== expectedValue;
    case "$gt":
      return actualValue > expectedValue;
    case "$gte":
      return actualValue >= expectedValue;
    case "$lt":
      return actualValue < expectedValue;
    case "$lte":
      return actualValue <= expectedValue;
    case "$in":
      return (
        Array.isArray(expectedValue) && expectedValue.includes(actualValue)
      );
    case "$nin":
      return (
        Array.isArray(expectedValue) && !expectedValue.includes(actualValue)
      );
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}
