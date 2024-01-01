export class LogootNode<T> {
  id: T;
  value: string;
  children: Array<LogootNode<T>>;
  parent: LogootNode<T> | null;
  size: number;
  empty: boolean;
  static compare: any;

  constructor(id: T, value?: string) {
    this.id = id;
    this.value = value || '';
    this.children = [];
    this.parent = null;
    this.size = 1;
    this.empty = false;
  }

  private leftMostSearch(child: LogootNode<T>) {
    let start = 0;
    let end = this.children.length;
    let mid: number;
    while (start < end) {
      mid = Math.floor((start + end) / 2);
      if (LogootNode.compare(this.children[mid].id, child.id) < 0) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }
    return start;
  }

  private exactSearch(id: T) {
    let start = 0;
    let end = this.children.length - 1;
    let mid: number;
    while (start <= end) {
      mid = Math.floor((start + end) / 2);
      const comp = LogootNode.compare(this.children[mid].id, id);
      if (comp < 0) {
        start = mid + 1;
      } else if (comp > 0) {
        end = mid - 1;
      } else {
        return mid;
      }
    }
    return null;
  }

  adjustSize(amout: number) {
    this.size += amout;
    if (this.parent) this.parent.adjustSize(amout);
  }

  addChild(child: LogootNode<T>) {
    child.parent = this;
    const index = this.leftMostSearch(child);
    this.children.splice(index, 0, child);
    this.adjustSize(child.size);
    return child;
  }

  removeChild(child: LogootNode<T>) {
    const index = this.exactSearch(child.id);
    if (index === null) return;
    this.children.splice(index, 1);
    this.adjustSize(-child.size);
    return child;
  }

  setEmpty(value = true) {
    if (value === this.empty) return;
    this.empty = value;
    if (value) {
      this.adjustSize(-1);
    } else {
      this.adjustSize(1);
    }
  }

  trimEmpty() {
    if (!this.parent) return;
    if (this.empty && this.children.length === 0) {
      this.parent.removeChild(this);
      this.parent.trimEmpty();
    }
  }

  getPath(): Array<T> {
    if (!this.parent || !this.id) return [];
    return this.parent.getPath().concat([this.id]);
  }

  getChildById(id: T) {
    const index = this.exactSearch(id);
    if (index === null) return null;
    return this.children[index];
  }

  getChildByPath(path: Array<T>, build: boolean) {
    let current: LogootNode<T> = this;
    let next;
    const result = path.every((id: T) => {
      next = current.getChildById(id);
      if (!next) {
        if (!build) {
          return false;
        } else {
          next = new LogootNode<T>(id);
          current.addChild(next);
          next.setEmpty(true);
        }
      }
      current = next;
      return true;
    });
    if (!result) return null;
    return current;
  }

  getOrder(): number {
    if (!this.parent) return -1;
    let order = this.parent.getOrder();
    if (!this.parent.empty) order += 1;
    for (let i = 0; i < this.parent.children.length; i++) {
      if (LogootNode.compare(this.parent.children[i].id, this.id) === 0) break;
      order += this.parent.children[i].size;
    }
    return order;
  }

  getChildByOrder(order: number): LogootNode<T> | null {
    if (order === 0 && !this.empty) return this;
    let start = this.empty ? 0 : 1;
    let end = start;
    for (let i = 0; i < this.children.length; i++) {
      end += this.children[i].size;
      if (start <= order && order < end) {
        return this.children[i].getChildByOrder(order - start);
      }
      start = end;
    }
    return null;
  }

  walk(fn: (node: LogootNode<T>) => void) {
    fn(this);
    this.children.forEach((child) => {
      child.walk(fn);
    });
  }
}
