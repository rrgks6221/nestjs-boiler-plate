export class OffsetPage<M> {
  constructor(
    public readonly data: M[],
    public readonly currentPage: number,
    public readonly perPage: number,
    public readonly totalCount: number,
  ) {}

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.perPage);
  }
}
