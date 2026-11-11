import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('cpp-struct-template.generateMinHeap', () => {
        const editor = vscode.window.activeTextEditor;
        
        if (editor) {
            // Каркас низкоуровневой кучи для C++26
            const heapTemplate = `template <typename T>
class MinHeap {
private:
    T* data;
    size_t capacity;
    size_t current_size;

    void heapify_up(size_t index) {
        while (index > 0 && data[(index - 1) / 2] > data[index]) {
            T temp = data[(index - 1) / 2];
            data[(index - 1) / 2] = data[index];
            data[index] = temp;
            index = (index - 1) / 2;
        }
    }

public:
    MinHeap(size_t cap) : capacity(cap), current_size(0) {
        data = new T[capacity];
    }

    ~MinHeap() {
        delete[] data;
    }

    void push(const T& value) {
        if (current_size == capacity) {
            return; 
        }
        data[current_size] = value;
        heapify_up(current_size);
        current_size++;
    }

    T get_min() const {
        return data[0];
    }
};
`;
            
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, heapTemplate);
            });
            vscode.window.showInformationMessage('Min-Heap C++26 шаблон успешно сгенерирован!');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}