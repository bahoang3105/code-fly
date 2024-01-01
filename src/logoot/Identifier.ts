export class Identifier {
  int: number;
  site: string;
  clock: number;

  constructor(int: number, site: string, clock: number) {
    this.int = int;
    this.site = site;
    this.clock = clock;
  }

  compare(other: Identifier) {
    if (this.int > other.int) {
      return 1;
    } else if (this.int < other.int) {
      return -1;
    } else {
      if (this.site > other.site) {
        return 1;
      } else if (this.site < other.site) {
        return -1;
      } else {
        if (this.clock > other.clock) {
          return 1;
        } else if (this.clock < other.clock) {
          return -1;
        } else {
          return 0;
        }
      }
    }
  }
}
