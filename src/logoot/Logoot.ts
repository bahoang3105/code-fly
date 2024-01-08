import EventEmitter from 'nanobus';
import { Identifier } from './Identifier';
import { LogootNode } from './LogootNode';
import { randomInt } from '../utils';

const INT_MIN = 1;
const INT_MAX = Number.MAX_SAFE_INTEGER;
const BASE = Math.pow(2, 8);

export enum EventName {
  OPERATION = 'operation',
  INSERT = 'insert',
  DELETE = 'delete'
}

export class Logoot {
  site: string;
  clock: number;
  addListener: (event: string, listener: any) => EventEmitter;
  removeListener: (event: string, listener: any) => void;
  private eventEmitter: EventEmitter;
  private deleteQueue: Array<Identifier[]>;
  private root: LogootNode<Identifier>;

  constructor(site: string, state?: any) {
    this.eventEmitter = new EventEmitter();
    this.addListener = this.eventEmitter.addListener.bind(this.eventEmitter);
    this.removeListener = this.eventEmitter.removeListener.bind(this.eventEmitter);
    this.site = site;
    this.clock = 0;
    this.deleteQueue = [];

    LogootNode.compare = (a: Identifier, b: Identifier) => a.compare(b);
    this.root = new LogootNode(new Identifier(0, '', 0));
    this.root.setEmpty(false);
    this.root.addChild(new LogootNode(new Identifier(INT_MIN, '', 0)));
    this.root.addChild(new LogootNode(new Identifier(INT_MAX, '', 0)));

    if (state) this.setState(state);
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
    this.eventEmitter.emit(EventName.OPERATION, { type: EventName.INSERT, position, char });
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
    this.eventEmitter.emit(EventName.OPERATION, { type: EventName.DELETE, position });
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

  getState() {
    return JSON.stringify(
      {
        root: this.root,
        deleteQueue: this.deleteQueue
      },
      (key, value) => (key === 'parent' ? undefined : value)
    );
  }

  private parseId(id: any) {
    return new Identifier(id.int, id.site, id.clock);
  }

  private arePositionEqual(a: Identifier[], b: Identifier[]) {
    if (a.length !== b.length) return false;
    return a.every((identify, index) => identify.compare(b[index]) === 0);
  }

  setState(state: string) {
    const parsed = JSON.parse(state);

    const parseNode = (n: LogootNode<Identifier>, parent: LogootNode<Identifier> | null) => {
      const node = new LogootNode(this.parseId(n.id), n.value);
      node.parent = parent;
      node.children = n.children.map((child) => parseNode(child, node));
      node.size = n.size;
      node.empty = n.empty;
      return node;
    };

    this.root = parseNode(parsed.root, null);
    this.deleteQueue = parsed.deleteQueue.map((id: any) => this.parseId(id));
  }

  receive(message: any) {
    try {
      if (message.from) {
        console;
      }
      const data = message.data;
      if (data.type === EventName.INSERT) {
        data.position = data.position.map((id: any) => this.parseId(id));
        const deleteQueueIndex = this.deleteQueue.findIndex((pos) => this.arePositionEqual(pos, data.position));
        if (deleteQueueIndex > -1) {
          this.deleteQueue.splice(deleteQueueIndex, 1);
          return;
        }
        const existingNode = this.root.getChildByPath(data.position, false);
        if (existingNode) return; // this node has been already inserted, ignore this event

        const node = this.root.getChildByPath(data.position, true);
        if (node) {
          node.value = data.char;
          node.setEmpty(false);
          this.eventEmitter.emit(EventName.INSERT);
        }
      } else if (data.type === EventName.DELETE) {
        data.position = data.position.map((id: any) => this.parseId(id));
        const node = this.root.getChildByPath(data.position, false);
        if (node && !node.empty) {
          node.setEmpty(true);
          node.trimEmpty();
          this.eventEmitter.emit(EventName.DELETE);
        } else if (data.position.site !== this.site) {
          // case delete event go before insert event
          const isExistInDeleteQueue = this.deleteQueue.some((pos) => this.arePositionEqual(pos, data.position));
          if (!isExistInDeleteQueue) {
            this.deleteQueue.push(data.position);
          }
        }
      } else {
        throw Error('Unhandler event');
      }
    } catch (err) {
      console.warn('Cannot handle received event', message, err);
    }
  }
}
