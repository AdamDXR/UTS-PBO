import { LibraryItem } from '../models/LibraryItem';
import { Member } from '../models/Member';
import { LoanRecord } from '../models/LoanRecord';
import { Borrowable } from '../interfaces/Borrowable';
import { ItemCategory, MemberStats, CatalogSummary } from '../types/index';

export class Library {
  public readonly name: string;
  private members: Map<string, Member> = new Map();
  private items: Map<string, LibraryItem> = new Map();
  private loanHistory: Array<LoanRecord> = [];
  private loanCounter: number = 0;

  constructor(name: string) {
    this.name = name;
  }

  public addItem(item: LibraryItem): void {
    if (this.items.has(item.itemId)) {
      throw new Error(`Item dengan ID ${item.itemId} sudah ada`);
    }
    this.items.set(item.itemId, item);
  }

  public registerMember(member: Member): void {
    if (this.members.has(member.memberId)) {
      throw new Error(`Member dengan ID ${member.memberId} sudah ada`);
    }
    this.members.set(member.memberId, member);
  }

  public findItem(itemId: string): LibraryItem {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item dengan ID '${itemId}' tidak ditemukan`);
    }
    return item;
  }

  public findMember(memberId: string): Member {
    const member = this.members.get(memberId);
    if (!member) {
      throw new Error(`Anggota dengan ID '${memberId}' tidak ditemukan`);
    }
    return member;
  }

  public searchItems(keyword: string): LibraryItem[] {
    const lowerKeyword = keyword.toLowerCase();
    return Array.from(this.items.values()).filter(
      item => item.getTitle().toLowerCase().includes(lowerKeyword)
    );
  }

  public getCatalogSummary(): CatalogSummary {
    const byCategory = new Map<ItemCategory, number>();
    for (const item of this.items.values()) {
      const category = item.getCategory();
      byCategory.set(category, (byCategory.get(category) || 0) + 1);
    }
    return {
      total: this.items.size,
      byCategory
    };
  }

  private generateLoanId(): string {
    this.loanCounter++;
    return `LN-${this.loanCounter.toString().padStart(4, '0')}`;
  }

  private isBorrowable(item: LibraryItem): item is LibraryItem & Borrowable {
    return 'borrow' in item && 'returnItem' in item && 'isAvailable' in item && 'getBorrowCount' in item;
  }

  public borrowItem(memberId: string, itemId: string, borrowDate: Date = new Date()): LoanRecord {
    // 1. Throw jika member tidak ditemukan
    const member = this.findMember(memberId);

    // 2. Throw jika item tidak ditemukan
    const item = this.findItem(itemId);

    // 3. Throw jika member sudah di batas pinjam
    if (!member.canBorrow()) {
      throw new Error(`Tidak dapat meminjam, batas pinjam aktif (${Member.MAX_LOANS} item) sudah tercapai.`);
    }

    // 4. Throw jika item tidak mengimplementasikan Borrowable
    if (!this.isBorrowable(item)) {
      throw new Error('Item ini tidak dapat dipinjam. Buku digital dapat diakses langsung tanpa peminjaman.');
    }

    // 5. Throw jika item tidak tersedia
    if (!item.isAvailable()) {
      throw new Error('Item tidak tersedia, stok habis.');
    }

    // 6. Proses peminjaman
    member.addLoan(itemId);
    item.borrow();

    const record = new LoanRecord(this.generateLoanId(), memberId, itemId, borrowDate);
    this.loanHistory.push(record);
    return record;
  }

  public returnItem(memberId: string, itemId: string): LoanRecord {
    // 1. Throw jika member tidak ditemukan
    const member = this.findMember(memberId);

    // 2. Throw jika item tidak ditemukan
    const item = this.findItem(itemId);

    // 3. Throw jika member tidak memiliki pinjaman aktif untuk item ini
    if (!member.hasActiveLoan(itemId)) {
      throw new Error('Anggota ini tidak memiliki pinjaman aktif untuk item tersebut');
    }

    member.removeLoan(itemId);

    if (this.isBorrowable(item)) {
      item.returnItem();
    }

    const record = this.loanHistory.find(
      r => r.memberId === memberId && r.itemId === itemId && !r.isReturned()
    );
    if (record) {
      record.markReturned();
    }

    return record!;
  }

  public filterByCategory(category: ItemCategory): LibraryItem[] {
    return Array.from(this.items.values()).filter(item => item.getCategory() === category);
  }

  public sortByYear(descending: boolean): LibraryItem[] {
    return Array.from(this.items.values()).sort((a, b) => {
      return descending ? b.getYear() - a.getYear() : a.getYear() - b.getYear();
    });
  }

  public getActiveLoans(): LoanRecord[] {
    return this.loanHistory.filter(r => !r.isReturned());
  }

  public getOverdueLoans(dueDays: number): LoanRecord[] {
    return this.getActiveLoans().filter(r => r.getDaysOverdue(dueDays) > 0);
  }

  public getMemberStats(memberId: string): MemberStats {
    const member = this.findMember(memberId);

    const memberRecords = this.loanHistory.filter(r => r.memberId === memberId);
    const activeRecords = memberRecords.filter(r => !r.isReturned());
    const totalFine = activeRecords.reduce((sum, r) => sum + r.getFine(7, 1000), 0);

    return {
      memberId: memberId,
      name: member.getName(),
      totalBorrowed: memberRecords.length,
      activeLoans: activeRecords.length,
      totalFine
    };
  }

  public getMostBorrowedItems(topN: number): LibraryItem[] {
    const borrowableItems = Array.from(this.items.values()).filter(i => this.isBorrowable(i));
    const sorted = borrowableItems.sort((a, b) => {
      const bCount = (b as unknown as Borrowable).getBorrowCount();
      const aCount = (a as unknown as Borrowable).getBorrowCount();
      return bCount - aCount;
    });
    return sorted.slice(0, topN);
  }

  public getTotalFines(dueDays: number, ratePerDay: number): number {
    return this.getOverdueLoans(dueDays).reduce((sum, r) => sum + r.getFine(dueDays, ratePerDay), 0);
  }
}
