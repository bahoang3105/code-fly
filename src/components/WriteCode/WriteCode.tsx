import { Editor } from '../Editor';
import './WriteCode.scss';

export const WriteCode = () => {
  return (
    <div className="write-code">
      <div className="write-code__editor">
        <Editor />
      </div>
    </div>
  );
};
