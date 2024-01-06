import { useEffect } from 'react';
import { useWebsocketContext } from '../../providers/WebsocketProvider';
import { Editor } from '../Editor';
import './WriteCode.scss';

export const WriteCode = () => {
  const { send, status } = useWebsocketContext();
  useEffect(() => {
    const it = setTimeout(() => {
      send('hihi', 123123);
    }, 1000);
    return () => clearTimeout(it);
  }, [status]);
  return (
    <div className="write-code">
      <div className="write-code__editor">
        <Editor />
      </div>
    </div>
  );
};
