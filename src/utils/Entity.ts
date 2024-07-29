export interface Entity {
  id: number;
  toDto(): Record<string, unknown>;
}

export interface EntityConstructor<T extends Entity> {
  new (...args: any[]): T;
  fromDto(dto: Record<string, unknown>): T;
}
