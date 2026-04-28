import { ItemCategory } from '../types/index';

export abstract class LibraryItem {
  public readonly itemId!: string;
  protected title!: string;
  protected year!: number;

  constructor(itemId: string, title: string, year: number) {
    if (new.target === LibraryItem) {
      throw new Error("Cannot instantiate abstract class");
    }
    Object.defineProperty(this, 'itemId', { value: itemId, writable: false, enumerable: true });
    this.title = title;
    this.year = year;
  }

  public getTitle(): string {
    return this.title;
  }

  public getYear(): number {
    return this.year;
  }

  public abstract getCategory(): ItemCategory;
  public abstract getDescription(): string;

  public toString(): string {
    return `[${this.getCategory()}] ${this.itemId} - ${this.title} (${this.year})`;
  }
}
