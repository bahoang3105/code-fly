const Editor = () => {
  return <div contentEditable={true} onInput={(e) => console.log(e)} />;
};

export default Editor;
