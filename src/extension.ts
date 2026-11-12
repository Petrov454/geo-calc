import * as vscode from 'vscode';
import { evaluateLine } from './calc';

const deco = vscode.window.createTextEditorDecorationType({});
let auto = true;

function commentPrefix(lang: string): string {
  if (['python', 'shellscript', 'yaml', 'ruby'].includes(lang)) { return '  # '; }
  if (['plaintext', 'markdown'].includes(lang)) { return ' '; }
  return '  // ';
}

function refresh(editor?: vscode.TextEditor) {
  if (!editor) { return; }
  const opts: vscode.DecorationOptions[] = [];
  if (auto) {
    const max = Math.min(editor.document.lineCount, 5000);
    for (let i = 0; i < max; i++) {
      const line = editor.document.lineAt(i);
      const r = evaluateLine(line.text);
      if (r) {
        opts.push({
          range: line.range,
          renderOptions: { after: {
            contentText: `  → ${r.value}  (${r.description})`,
            color: new vscode.ThemeColor('editorCodeLens.foreground'),
            fontStyle: 'italic'
          } }
        });
      }
    }
  }
  editor.setDecorations(deco, opts);
}

export function activate(context: vscode.ExtensionContext) {
  let timer: NodeJS.Timeout | undefined;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => refresh(vscode.window.activeTextEditor), 200);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('geoCalc.evaluate', async () => {
      const ed = vscode.window.activeTextEditor;
      if (!ed) { return; }
      const line = ed.document.lineAt(ed.selection.active.line);
      const r = evaluateLine(line.text);
      if (!r) {
        vscode.window.showWarningMessage('Geo Calc: не удалось распознать выражение');
        return;
      }
      const m = line.text.match(/\s*=\s*\?\s*$/);
      await ed.edit(b => {
        if (m) {
          const start = line.text.length - m[0].length;
          b.replace(new vscode.Range(line.lineNumber, start, line.lineNumber, line.text.length), ` = ${r.value}`);
        } else {
          b.insert(line.range.end, `${commentPrefix(ed.document.languageId)}= ${r.value}`);
        }
      });
    }),
    vscode.commands.registerCommand('geoCalc.toggleAuto', () => {
      auto = !auto;
      refresh(vscode.window.activeTextEditor);
    }),
    vscode.window.onDidChangeActiveTextEditor(e => refresh(e)),
    vscode.workspace.onDidChangeTextDocument(schedule),
    deco
  );
  refresh(vscode.window.activeTextEditor);
}

export function deactivate() {}