import { useEffect } from 'react';
import { useWebsocketContext } from '../../providers/WebsocketProvider';
import { Editor } from '../Editor';
import './WriteCode.scss';
import { WebsocketState } from '../../types';

export const WriteCode = () => {
  const { send, status } = useWebsocketContext();
  useEffect(() => {
    if (status === WebsocketState.OPEN) {
      send('user-connect', { userId: Math.round(Math.random() * 1000000), username: 'Hoang' });
    }
  }, [status]);
  return (
    <div className="write-code">
      <div className="write-code__editor">
        <Editor />
      </div>
    </div>
  );
};
