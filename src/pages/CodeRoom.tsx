import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { WebsocketProvider } from '../providers/WebsocketProvider';
import { WriteCode } from '../components/WriteCode';

const CodeRoom = () => {
  const { id } = useParams();
  const url = useMemo(() => {
    return `ws://127.0.0.1:8000/ws/code_editor/${id}/`;
  }, [id]);

  return (
    <WebsocketProvider url={url}>
      <WriteCode />
    </WebsocketProvider>
  );
};

export default CodeRoom;
