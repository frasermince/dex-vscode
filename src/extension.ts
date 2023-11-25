// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { FileExplorer } from "./provider";
import * as path from "path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "dex" is now active!');
  console.log("WORKSPACE FOLDERS", vscode.workspace.workspaceFolders);
  let imagesExist = false;
  let jsonFilesExist = false;

  async function checkWorkspaceFolders() {
    if (vscode.workspace.workspaceFolders) {
      for (const folder of vscode.workspace.workspaceFolders) {
        const imagesPath = vscode.Uri.joinPath(folder.uri, "images");
        const jsonFilesPath = vscode.Uri.joinPath(folder.uri, "json_files");

        try {
          await vscode.workspace.fs.stat(imagesPath);
          await vscode.workspace.fs.stat(jsonFilesPath);
          return true;
        } catch (error) {
          console.error(error);
        }
      }
    }
    return false;
  }

  const workspaceIsValid = await checkWorkspaceFolders();
  if (workspaceIsValid) {
    new FileExplorer(context);
  }

  let nextFileCommand = vscode.commands.registerCommand(
    "dex.nextFile",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        console.log("EDITOR", editor);
        const document = editor.document;
        const directoryPath = path.dirname(document.fileName);
        const files = await vscode.workspace.fs.readDirectory(
          vscode.Uri.file(directoryPath)
        );
        const currentIndex = files.findIndex(
          ([file]) => path.join(directoryPath, file) === document.fileName
        );
        const nextFile = files[(currentIndex + 1) % files.length][0];
        const nextFileUri = vscode.Uri.file(path.join(directoryPath, nextFile));
        const nextFileWithoutExt = path.parse(nextFileUri.fsPath).name;
        const parentDirectoryPath = path.dirname(directoryPath);
        const imageResource = vscode.Uri.file(
          path.join(parentDirectoryPath, "images", nextFileWithoutExt + ".png")
        );

        const jsonResource = vscode.Uri.file(
          path.join(
            parentDirectoryPath,
            "json_files",
            nextFileWithoutExt + ".json"
          )
        );

        vscode.commands.executeCommand("vscode.open", imageResource, {
          viewColumn: vscode.ViewColumn.One,
        });
        vscode.window.showTextDocument(jsonResource, {
          viewColumn: vscode.ViewColumn.Two,
        });
      }
    }
  );
  context.subscriptions.push(nextFileCommand);

  let copyAndProgressCommand = vscode.commands.registerCommand(
    "dex.copyAndProgress",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        console.log("EDITOR", editor);
        const document = editor.document;
        const directoryPath = path.dirname(document.fileName);
        const files = await vscode.workspace.fs.readDirectory(
          vscode.Uri.file(directoryPath)
        );
        const currentIndex = files.findIndex(
          ([file]) => path.join(directoryPath, file) === document.fileName
        );
        const nextFile = files[(currentIndex + 1) % files.length][0];
        const nextFileUri = vscode.Uri.file(path.join(directoryPath, nextFile));
        const nextFileWithoutExt = path.parse(nextFileUri.fsPath).name;
        const parentDirectoryPath = path.dirname(directoryPath);

        const prevFileUri = vscode.Uri.file(document.fileName);
        const prevFileWithoutExt = path.parse(prevFileUri.fsPath).name;
        const prevJsonResource = vscode.Uri.file(
          path.join(
            parentDirectoryPath,
            "json_files",
            prevFileWithoutExt + ".json"
          )
        );
        const prevJsonContent = await vscode.workspace.fs.readFile(
          prevJsonResource
        );
        const imageResource = vscode.Uri.file(
          path.join(parentDirectoryPath, "images", nextFileWithoutExt + ".png")
        );

        const jsonResource = vscode.Uri.file(
          path.join(
            parentDirectoryPath,
            "json_files",
            nextFileWithoutExt + ".json"
          )
        );

        await vscode.workspace.fs.writeFile(jsonResource, prevJsonContent);
        vscode.commands.executeCommand("vscode.open", imageResource, {
          viewColumn: vscode.ViewColumn.One,
        });
        vscode.window.showTextDocument(jsonResource, {
          viewColumn: vscode.ViewColumn.Two,
        });
      }
    }
  );
  context.subscriptions.push(nextFileCommand);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("dex.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from dex!");
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
