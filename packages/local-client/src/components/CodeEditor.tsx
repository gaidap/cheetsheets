
import './CodeEditor.css';
import './syntax.css';
import MonacoEditor, { EditorDidMount } from '@monaco-editor/react';
import { useRef } from 'react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import jscodeshift from 'jscodeshift';
import Highlighter from 'monaco-jsx-highlighter';
import { IKeyboardEvent } from 'monaco-editor';

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const clearScreenShortCutPressed = (event: IKeyboardEvent): boolean => {
  return (
    event.code === 'Enter' && event.ctrlKey === true && event.altKey === true
  );
};

const reformatShortCutPressed = (event: IKeyboardEvent): boolean => {
  return (
    event.code === 'Enter' && event.ctrlKey === false && event.altKey === true
  );
};

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue }) => {
  const editorRef = useRef<any>();

  // Register a listener on editor startup to hook into change events to update our model state
  const editorDidMount: EditorDidMount = (getValue, editor) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      onChange(getValue());
    });

    editor.onKeyUp((event) => {
      if (clearScreenShortCutPressed(event)) {
        editorRef.current.setValue('');
      }
      if (reformatShortCutPressed(event)) {
        onClickFormat();
      }
    });

    editor.getModel()?.updateOptions({ tabSize: 2 });

    // Add custom highlighting for React component specific code
    const highlighter = new Highlighter(
      // @ts-ignore TS is not aware of the monaco object on the window
      window.monaco,
      jscodeshift,
      editor
    );

    highlighter.highLightOnDidChangeModelContent(
      // add empty error log functions as workaround to fix log clutter while typing
      () => {},
      () => {},
      undefined,
      () => {}
    );
  };

  const onClickFormat = () => {
    if (!editorRef.current) {
      // Do nothing if editor not ready
      return;
    }

    const unformattedCode = editorRef.current.getModel().getValue();
    const formattedCode = prettier
      .format(unformattedCode, {
        parser: 'babel',
        plugins: [parser],
        useTabs: false,
        semi: true,
        singleQuote: true,
      }) 
      .replace(/\n$/, ''); // prevent prettier to add trailing newline
      
    editorRef.current.setValue(formattedCode);
  };

  return (
    <div className="editor-wrapper">
      <button
        className="button button-format is-primary is-small"
        onClick={onClickFormat}
      >
        Format
      </button>
      <MonacoEditor
        editorDidMount={editorDidMount}
        value={initialValue}
        theme="dark"
        language="javascript"
        height="100%"
        options={{
          wordWrap: 'on',
          useTabStops: false,
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
