import { useEffect, useMemo, useRef, useState } from 'react';
import { Logoot } from '../../logoot';
import './Editor.scss';

export const Editor = () => {
  const logoot = useMemo(() => new Logoot('haiyen', localStorage.getItem('logoot')), []);
  const [caretStartPos, setCaretStartPos] = useState(0);
  const [caretEndPos, setCaretEndPos] = useState(0);
  const [text, setText] = useState(logoot.getValue());
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.selectionStart = caretStartPos;
      textAreaRef.current.selectionEnd = caretEndPos;
    }
  }, [text, caretStartPos, caretEndPos]);

  // handle enter, tab
  const handleKeyDown = async (event: any) => {
    if (!textAreaRef.current) return;
    const { key, ctrlKey, altKey, metaKey, shiftKey, target } = event;
    const { selectionStart, selectionEnd } = target;
    switch (key) {
      case 'Enter':
        insert('\n', selectionStart, selectionEnd);
        break;
      case 'Tab':
        insert('  ', selectionStart, selectionEnd, true);
        event.preventDefault();
        break;
      case 'Backspace':
        if (selectionStart === selectionEnd) {
          if (selectionStart > 0) {
            remove(selectionStart - 1, selectionStart, selectionStart === 1);
          }
        } else {
          remove(selectionStart, selectionEnd, selectionStart <= 1);
        }
        break;
      case 'Delete':
        if (selectionStart === selectionEnd) {
          remove(selectionStart, selectionStart + 1);
        } else {
          remove(selectionStart, selectionEnd);
        }
        break;
      default: {
        if (key.length === 1 && !ctrlKey && !altKey && !metaKey) {
          insert(key, selectionStart, selectionEnd);
        } else if ((ctrlKey || metaKey) && !altKey && !shiftKey) {
          // case hold Ctrl
          if (key.toLowerCase() === 'x') {
            copyText(text.slice(selectionStart, selectionEnd));
            remove(selectionStart, selectionEnd, true);
          }
          if (key.toLowerCase() === 'v') {
            const copiedText = (await navigator.clipboard.readText()).replaceAll('\r', '');
            insert(copiedText, selectionStart, selectionEnd, true);
          }
        }
      }
    }
    localStorage.setItem('logoot', logoot.getState());
  };

  const insert = (value: string, selectionStart: number, selectionEnd: number, needUpdateText = false) => {
    const len = value.length;
    logoot.replaceRange(value, selectionStart + 1, selectionEnd);
    setCaretStartPos(selectionStart + len);
    setCaretEndPos(selectionStart + len);
    needUpdateText && setText(logoot.getValue());
  };
  const remove = (selectionStart: number, selectionEnd: number, needUpdateText = false) => {
    logoot.delete(selectionStart + 1, selectionEnd);
    setCaretStartPos(selectionStart);
    setCaretEndPos(selectionStart);
    needUpdateText && setText(logoot.getValue());
  };
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleChange = () => {
    setText(logoot.getValue());
  };

  return (
    <div className="editor">
      <div className="editor__line-numbers"></div>
      <textarea
        value={text}
        ref={textAreaRef}
        className="editor__input"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
