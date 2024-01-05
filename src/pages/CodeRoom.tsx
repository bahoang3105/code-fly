import { useParams } from 'react-router-dom';
import { WebsocketProvider } from '../providers/WebsocketProvider';
import { useEffect, useMemo } from 'react';

const CodeRoom = () => {
  const { id } = useParams();
  const url = useMemo(() => {
    return 'ws://127.0.0.1:8000/ws/code_editor/' + id + '/';
  }, [id]);

  useEffect(() => {
    new WebSocket(url);
  }, []);
  return <div>asdasd</div>;
};

export default CodeRoom;
