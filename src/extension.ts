'use strict';
import * as vscode from 'vscode';
import { DepNodeProvider } from './nodeDependencies';
function location(moduleName, line, column){
	vscode.commands.executeCommand('vscode.open', vscode.Uri.file(moduleName))
	vscode.commands.executeCommand('revealLine', { lineNumber: line-1, at:'center'})
}

export function activate(context: vscode.ExtensionContext) {
	const nodeDependenciesProvider = new DepNodeProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('errorStack', nodeDependenciesProvider);
	context.subscriptions.push(vscode.commands.registerCommand('errorStack.refreshEntry', () => nodeDependenciesProvider.refresh()));
	context.subscriptions.push(vscode.commands.registerCommand('extension.openFile', (moduleName, line, column) => location(moduleName, line, column)));
}

export function deactivate() { }
