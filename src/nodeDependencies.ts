import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import errorPosition from './errorPosition';

const icon = {
	file: 'boolean',
	code: 'string',
	column: 'number',
	line: 'number',
}
export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;
	private list; 
	private config;
	constructor(private workspaceRoot: string) {
		this.getErrorStack();
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		console.log('getTreeItem', element);
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		console.log('this.workspaceRoot', this.workspaceRoot);
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}
		
		if (element) {
			return Promise.resolve(this.getContent(element));
		} else {
			return Promise.resolve(this.list);
		}

	}	
	private getContent(element): Dependency[]{
		console.log('getContent',element);
		if (element && element.content) {
			
			return Object.entries(element.content).map(([key,value])=>{
				let iconPath = {
					light: path.join(__filename,"../../resources/light/" + icon[key] + ".svg"),
					dark: path.join(__filename,"../../resources/dark/" + icon[key] + ".svg")
				};
				console.log('file', element, element.content.file,path.join(this.workspaceRoot, element.content.file));
				let result = {
					label: value + '',
					iconPath: iconPath,
					contextValue: 'item',
					collapsibleState: 0,
					tooltip: `${key}:${value}`,
					description: key,
					command: {
						command: 'extension.openFile',
						title: 'openfile',
						arguments: [path.join(this.workspaceRoot, element.content.file), element.content.line,element.content.column]
					}
				}
				return result;
			})
		} else {
			return [];
		}
	}
	private async getErrorStack() {
		let errorConfigPath = path.join(this.workspaceRoot, './error-config.json');
		if (this.pathExists(errorConfigPath)) {
			let errorConfig = null;
			try {
				errorConfig = JSON.parse(fs.readFileSync(errorConfigPath, 'utf8'));
			} catch {
			}
			if (!errorConfig){
				vscode.window.showInformationMessage('error-config.json文件解析失败，请检查json格式是否正确');
				return false;
			}
			if (!errorConfig.errorStack || typeof errorConfig.errorStack !== 'string') {
				vscode.window.showInformationMessage('errorStack不存在或不是字符串格式');
				return false;
			}
			this.config = errorConfig;
			let sourceMapPath = path.join(this.workspaceRoot, './'+ errorConfig.sourceMapPath);
 			if (!this.pathExists(sourceMapPath)){
				vscode.window.showInformationMessage('sourceMapPath文件路径错误');
				return false;
			} else {
				let result = await errorPosition(errorConfig.errorStack, sourceMapPath);
				console.log('result',result);
				this.dealErrorStack(result);
				return true;
			}
			
		} else {
			vscode.window.showInformationMessage('项目根目录下没有error-config.json文件');
			return false;
		}
	}

	private dealErrorStack(arr){
		console.log('dealErrorStack',arr);
		this.list = arr.map((value) => {
			let {
				code = '',
				source = '',
				line = '',
				column = '',
				stack = '',
				ret
			} = value;
			
			let iconPath = {
				light: path.join(__filename,"../../resources/light/folder.svg"),
				dark: path.join(__filename,"../../resources/dark/folder.svg")
			};
			if(ret){
				source = source.trim().replace('webpack://', this.config.sourcePath);
				return {
					iconPath: iconPath,
					contextValue: 'dependency',
					label: stack.msg || '',
					collapsibleState: 1,
					ret,
					content: {
						code:code.trim(),
						file: source,
						column,
						line,
					}
				}
			} else {
				return {
					iconPath: iconPath,
					contextValue: 'dependency',
					label: stack.msg,
					collapsibleState: 0,
					ret,
					content: {
						file: stack.url,
						code: stack.code,
						column: stack.col,
						line: stack.line,
					}
					
				}
			}
			
		});
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			console.error('err',err);
			return false;
		}

		return true;
	}
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	get description(): string {
		return `${this.label}`;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';

}
