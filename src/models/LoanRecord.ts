export class LoanRecord {
  public readonly loanId: string;
  public readonly memberId: string;
  public readonly itemId: string;
  public readonly borrowDate: Date;
  private returnDate: Date | null = null;

  constructor(loanId: string, memberId: string, itemId: string, borrowDate: Date = new Date()) {
    this.loanId = loanId;
    this.memberId = memberId;
    this.itemId = itemId;
    this.borrowDate = borrowDate;
  }

  public isReturned(): boolean {
    return this.returnDate !== null;
  }

  public markReturned(date: Date = new Date()): void {
    if (this.isReturned()) {
      throw new Error("Item sudah dikembalikan");
    }
    this.returnDate = date;
  }

  public getDaysOverdue(dueDays: number): number {
    const dateToCompare = this.returnDate || new Date();
    const diffTime = dateToCompare.getTime() - this.borrowDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays - dueDays);
  }

  public getFine(dueDays: number, ratePerDay: number): number {
    return this.getDaysOverdue(dueDays) * ratePerDay;
  }
}
