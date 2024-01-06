import { useRef, createContext, ReactNode, useEffect, useState, useContext, useCallback } from 'react';
import { Channels, ISocketContext, WebsocketState } from '../types';

const defaultContextValue: ISocketContext = {
  subscribe: (_channel: string, _callback: any) => {},
  unsubscribe: (_channel: string, _callback: any) => {},
  send: (_event: string, _data: any) => {},
  status: WebsocketState.UNINSTANTIATED
};

const WebsocketContext = createContext<ISocketContext>(defaultContextValue);

type IProps = {
  url: string;
  children: ReactNode;
};

const WebsocketProvider = ({ url, children }: IProps) => {
  const websocket = useRef<WebSocket | null>(null);
  const channels = useRef<Channels>({});
  const [status, setStatus] = useState<WebsocketState>(WebsocketState.UNINSTANTIATED);

  const subscribe = (channel: string, callback: any) => {
    if (!channels.current[channel]) {
      channels.current[channel] = [];
    }
    if (channels.current[channel].indexOf(callback) >= 0) return;
    channels.current[channel].push(callback);
  };

  const unsubscribe = (channel: string, callback: any) => {
    if (!channels.current[channel]) return;
    const callbackPosition = channels.current[channel].indexOf(callback);
    if (callbackPosition >= 0) {
      channels.current[channel].splice(callbackPosition, 1);
    }
  };

  const send = (event: string, data: any) => {
    if (websocket.current && status === WebsocketState.OPEN) {
      websocket.current.send(JSON.stringify({ event, data }));
    }
  };

  useEffect(() => {
    setStatus(WebsocketState.CONNECTING);
    websocket.current = new WebSocket(url);
    websocket.current.onopen = () => setStatus(WebsocketState.OPEN);
    websocket.current.onclose = () => setStatus(WebsocketState.CLOSED);
    websocket.current.onerror = (error) => console.warn(error);
    websocket.current.onmessage = (message: any) => {
      console.log(message);
    };
    return () => {
      setStatus(WebsocketState.CLOSING);
      websocket.current?.close?.();
    };
  }, [url]);

  return (
    <WebsocketContext.Provider value={{ subscribe, unsubscribe, status, send }}>{children}</WebsocketContext.Provider>
  );
};

const useWebsocketContext = () => {
  return useContext(WebsocketContext);
};

export { useWebsocketContext, WebsocketProvider };
