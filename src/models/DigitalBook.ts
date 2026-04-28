import { LibraryItem } from './LibraryItem';
import { ItemCategory } from '../types/index';

export class DigitalBook extends LibraryItem {
  private author: string;
  public readonly fileUrl!: string;

  constructor(
    itemId: string,
    title: string,
    year: number,
    author: string,
    fileUrl: string
  ) {
    super(itemId, title, year);
    this.author = author;
    Object.defineProperty(this, 'fileUrl', { value: fileUrl, writable: false, enumerable: true });
  }

  public getAuthor(): string {
    return this.author;
  }

  public getCategory(): ItemCategory {
    return "digital";
  }

  public getDescription(): string {
    return `Digital Book by ${this.author} at ${this.fileUrl}`;
  }
}
