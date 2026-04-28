export class Member {
  public static readonly MAX_LOANS: number = 3;

  public readonly memberId!: string;
  private name: string;
  private email: string;
  private activeLoans: Set<string> = new Set();

  constructor(memberId: string, name: string, email: string) {
    Object.defineProperty(this, 'memberId', { value: memberId, writable: false, enumerable: true });
    this.name = name;
    this.email = email;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string {
    return this.email;
  }

  public canBorrow(): boolean {
    return this.activeLoans.size < Member.MAX_LOANS;
  }

  public addLoan(itemId: string): void {
    if (this.activeLoans.has(itemId)) {
      throw new Error(`Member sudah meminjam item '${itemId}'`);
    }
    if (!this.canBorrow()) {
      throw new Error(`Tidak dapat meminjam, batas pinjam aktif (${Member.MAX_LOANS} item) sudah tercapai`);
    }
    this.activeLoans.add(itemId);
  }

  public removeLoan(itemId: string): void {
    if (!this.activeLoans.has(itemId)) {
      throw new Error(`Anggota ini tidak memiliki pinjaman aktif untuk item tersebut`);
    }
    this.activeLoans.delete(itemId);
  }

  public hasActiveLoan(itemId: string): boolean {
    return this.activeLoans.has(itemId);
  }

  public getActiveLoanCount(): number {
    return this.activeLoans.size;
  }
}
