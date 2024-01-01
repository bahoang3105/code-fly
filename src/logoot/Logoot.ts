import { randomInt } from '../utils';
import { Identifier } from './Identifier';
import { LogootNode } from './LogootNode';

const INT_MIN = 1;
const INT_MAX = Number.MAX_SAFE_INTEGER;
const BASE = Math.pow(2, 8);

export class Logoot {
  site: string;
  clock: number;
  private deleteQueue: Array<any>;
  private root: LogootNode<Identifier>;

  constructor(site: string, state?: any) {
    this.site = site;
    this.clock = 0;
    this.deleteQueue = [];

    LogootNode.compare = (a: Identifier, b: Identifier) => a.compare(b);
    this.root = new LogootNode(new Identifier(0, '', 0));
    this.root.setEmpty(false);
    this.root.addChild(new LogootNode(new Identifier(INT_MIN, '', 0)));
    this.root.addChild(new LogootNode(new Identifier(INT_MAX, '', 0)));
  }

  insert(value: string, index: number) {
    value.split('').forEach((char, i) => {
      this._insert(char, index + i);
    });
  }

  private _insert(char: string, index: number) {
    index = Math.min(index, this.length);

    const prev = this.root.getChildByOrder(index);
    const next = this.root.getChildByOrder(index + 1);
    if (!prev || !next) return;

    const prevPos = prev.getPath();
    const nextPos = next.getPath();

    const position = this.generatePositionBetween(prevPos, nextPos);

    const node = this.root.getChildByPath(position, true);
    if (!node) return;
    node.value = char;
    node.setEmpty(false);
  }

  private doubledBase(depth: number) {
    return Math.min(BASE * Math.pow(2, depth), INT_MAX);
  }

  private generateNewIdentier(prev: number, next: number) {
    const int = randomInt(prev, next);
    return new Identifier(int, this.site, this.clock++);
  }

  private generatePositionBetween(prevPos: Array<Identifier>, nextPos: Array<Identifier>) {
    const newPos: Array<Identifier> = [];
    const maxLength = Math.max(prevPos.length, nextPos.length);
    let samePrefixes = true;

    for (let depth = 0; depth < maxLength + 1; depth++) {
      const depthMax = this.doubledBase(depth);
      const prevId = prevPos[depth] || new Identifier(INT_MIN, '', 0);
      const nextId = samePrefixes && nextPos[depth] ? nextPos[depth] : new Identifier(depthMax, '', 0);

      const diff = nextId.int - prevId.int;
      if (diff > 1) {
        newPos.push(this.generateNewIdentier(prevId.int, nextId.int));
        break;
      } else {
        if (prevId.site === '' && depth > 0) prevId.site = this.site;
        newPos.push(prevId);
        if (prevId.compare(nextId) !== 0) samePrefixes = false;
      }
    }

    return newPos;
  }

  delete(start: number, end = start) {
    for (let i = start; i <= end; i++) {
      this._delete(start);
    }
  }

  private _delete(index: number) {
    const node = this.root.getChildByOrder(index + 1);
    if (!node || node.id === null || node.id.site === '') return;

    const position = node.getPath();
    node.setEmpty(true);
    node.trimEmpty();
  }

  getValue() {
    const arr: Array<string> = [];
    this.root.walk((node) => {
      if (!node.empty) arr.push(node.value);
    });
    return arr.join('');
  }

  get length(): number {
    return this.root.size - 2;
  }

  replaceRange(value: string, start: number, end: number) {
    this.delete(start, end);
    this.insert(value, start);
  }

  setValue(value: string) {
    this.replaceRange(value, 0, this.length);
  }
}
