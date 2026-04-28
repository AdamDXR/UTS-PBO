import { LibraryItem } from './LibraryItem';
import { Borrowable } from '../interfaces/Borrowable';
import { ItemCategory } from '../types/index';

export class Book extends LibraryItem implements Borrowable {
  private author: string;
  private totalCopies: number;
  private availableCopies: number;
  private borrowCount: number = 0;

  constructor(
    itemId: string,
    title: string,
    year: number,
    author: string,
    totalCopies: number
  ) {
    super(itemId, title, year);
    this.author = author;
    this.totalCopies = totalCopies;
    this.availableCopies = totalCopies;
  }

  public getAuthor(): string {
    return this.author;
  }

  public getCategory(): ItemCategory {
    return "book";
  }

  public getDescription(): string {
    return `Book: ${this.title} by ${this.author}`;
  }

  public isAvailable(): boolean {
    return this.availableCopies > 0;
  }

  public borrow(): boolean {
    if (this.isAvailable()) {
      this.availableCopies--;
      this.borrowCount++;
      return true;
    }
    return false;
  }

  public returnItem(): void {
    if (this.availableCopies < this.totalCopies) {
      this.availableCopies++;
    }
  }

  public getBorrowCount(): number {
    return this.borrowCount;
  }

  public getAvailableCopies(): number {
    return this.availableCopies;
  }
}
