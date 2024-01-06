export interface ISocketContext {
  subscribe: (channel: string, callback: any) => void;
  unsubscribe: (channel: string, callback: any) => void;
  send: (event: string, data: any) => void;
  status: WebsocketState;
}

export type Channels = {
  [key: string]: Array<any>;
};

export enum WebsocketState {
  UNINSTANTIATED,
  OPEN,
  CONNECTING,
  CLOSING,
  CLOSED
}
