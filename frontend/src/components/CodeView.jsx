import React, { lazy, Suspense, useMemo } from 'react';

// Lazy-load Monaco Editor to avoid bundling costs
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const langMap = {
  c: 'c',
  cpp: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  php: 'php',
  html: 'html',
  sql: 'sql',
  plaintext: 'plaintext',
};

function guessLanguage(code) {
  if (!code) return 'plaintext';
  const s = code.trim();
  if (/^#include|std::|using namespace/.test(s)) return 'cpp';
  if (/^#include\s+<stdio.h>|^int\s+main\(|printf\(/.test(s)) return 'c';
  if (/^import\s+java\.|public class|System\.out\./.test(s)) return 'java';
  if (/^import\s+|def\s+\w+\(|print\(/.test(s)) return 'python';
  if (/^<\!DOCTYPE|<html|<div|<span/.test(s)) return 'html';
  if (/^SELECT\s|INSERT\s+INTO|CREATE\s+TABLE/i.test(s)) return 'sql';
  if (/console\.log|function\s+|var\s+|let\s+|const\s+/.test(s)) return 'javascript';
  return 'plaintext';
}

function resolveLanguage(lang, code) {
  if (lang && langMap[lang]) return langMap[lang];
  return guessLanguage(code);
}

export default function CodeView({ code = '', language = null, height = null, readOnly = true }) {
  const resolvedLang = useMemo(() => resolveLanguage(language, code), [language, code]);
  const calcHeight = useMemo(() => {
    const lines = code.split('\n').length || 1;
    const px = Math.min(Math.max(lines * 18 + 20, 80), 520);
    return height || `${px}px`;
  }, [code, height]);

  const fallback = (
    <pre className="text-emerald-300 font-mono text-sm p-3 whitespace-pre-wrap overflow-x-auto">
      {code}
    </pre>
  );

  return (
    <div className="rounded-lg border border-emerald-500/10 bg-[#0B0F0E] overflow-hidden" style={{ contain: 'layout style' }}>
      <Suspense fallback={fallback}>
        <MonacoEditor
          height={calcHeight}
          defaultLanguage={resolvedLang}
          defaultValue={code}
          theme="vs-dark"
          options={{
            readOnly: readOnly,
            minimap: { enabled: false },
            folding: false,
            renderLineHighlight: 'none',
            lineNumbers: 'on',
            contextmenu: false,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              handleMouseWheel: true,
              alwaysConsumeMouseWheel: false
            },
            mouseWheelZoom: false,
            fastScrollSensitivity: 5,
            smoothScrolling: true,
            renderValidationDecorations: 'off',
            renderWhitespace: 'none'
          }}
        />
      </Suspense>
    </div>
  );
}
