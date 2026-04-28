import { LibraryItem } from './LibraryItem';
import { Borrowable } from '../interfaces/Borrowable';
import { ItemCategory } from '../types/index';

export class Magazine extends LibraryItem implements Borrowable {
  private publisher: string;
  public readonly issueNumber!: number;
  private available: boolean = true;
  private borrowCount: number = 0;

  constructor(
    itemId: string,
    title: string,
    year: number,
    publisher: string,
    issueNumber: number
  ) {
    super(itemId, title, year);
    this.publisher = publisher;
    Object.defineProperty(this, 'issueNumber', { value: issueNumber, writable: false, enumerable: true });
  }

  public getCategory(): ItemCategory {
    return "magazine";
  }

  public getDescription(): string {
    return `Magazine Issue ${this.issueNumber} by ${this.publisher}`;
  }

  public isAvailable(): boolean {
    return this.available;
  }

  public borrow(): boolean {
    if (this.isAvailable()) {
      this.available = false;
      this.borrowCount++;
      return true;
    }
    return false;
  }

  public returnItem(): void {
    this.available = true;
  }

  public getBorrowCount(): number {
    return this.borrowCount;
  }

  public getAvailableCopies(): number {
    return this.available ? 1 : 0;
  }
}
