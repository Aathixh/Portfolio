// File system interfaces and types
export interface FileSystemItem {
  type: "file" | "directory";
  content?: string;
  children?: { [key: string]: FileSystemItem };
}

export interface FileSystem {
  [key: string]: FileSystemItem;
}

// Main file system structure
export const fileSystem: FileSystem = {
  "/": {
    type: "directory",
    children: {
      home: {
        type: "directory",
        children: {
          aathish: {
            type: "directory",
            children: {
              projects: {
                type: "directory",
                children: {
                  "zenlock.md": {
                    type: "file",
                    content:
                      "ZenLock - Door Automation System (Sep 2024 - Jul 2025)\nTeam Size: 3\nKey Skills: React Native, Mobile Application Development, UI Development, HTTP\nGitHub: https://github.com/Aathixh/ZenLock\n\nDeveloped a React Native application for door automation helping differently-abled individuals. Enables remote door control via smartphone integration with microcontroller. Features user-centered design and intelligent setup process. Demonstrates expertise in IoT, React Native and Wi-Fi management.",
                  },
                  "efdin.md": {
                    type: "file",
                    content:
                      "EFDIN - Food Wastage Reduction Platform (Apr 2024 - May 2024)\nTeam Size: 4\nKey Skills: PHP, Laravel, SQL, MVC, CSS, HTML5\nGitHub: https://github.com/Aathixh/EL\n\nOnline platform built during DEFINE'24 Hackathon at MBCET focused on combating food wastage through surplus food redistribution.",
                  },
                  "onroutex.md": {
                    type: "file",
                    content:
                      "OnRouteX - Real Time Bus Tracking System (Sep 2023 - Jan 2024)\nTeam Size: 6\nKey Skills: PHP, Laravel, SQL, HTTP\nGitHub: https://github.com/Aathixh/TrackBus\n\nA real-time bus tracking and booking system designed to simplify transit management.Project was selected as a finalist in Smart India Hackathon 2023.",
                  },
                },
              },
              skills: {
                type: "directory",
                children: {
                  "skills.txt": {
                    type: "file",
                    content:
                      "• React.js\n• React Native\n• TypeScript\n• JavaScript\n• HTML5\n• CSS3\n• PHP\n• Laravel\n• Python\n• Java\n• Supabase\n• Git\n• GitHub\n• MySQL\n• SQL",
                  },
                },
              },
              "contact.txt": {
                type: "file",
                content:
                  "• Email: aathishrv@gmail.com\n• LinkedIn: linkedin.com/in/aathishrviswam",
              },
            },
          },
        },
      },
      usr: {
        type: "directory",
        children: {
          bin: { type: "directory", children: {} },
        },
      },
    },
  },
};

export class FileSystemNavigator {
  private fileSystem: FileSystem;

  constructor(fileSystem: FileSystem) {
    this.fileSystem = fileSystem;
  }

  navigatePath = (path: string): FileSystemItem | null => {
    if (path === "/") return this.fileSystem["/"];

    const parts = path.split("/").filter(Boolean);
    let current = this.fileSystem["/"];

    for (const part of parts) {
      if (current?.children?.[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }

    return current;
  };

  getDirectoryContents = (path: string): string[] => {
    const dir = this.navigatePath(path);
    if (!dir || dir.type !== "directory") return [];

    return Object.entries(dir.children || {}).map(([name, item]) => {
      return item.type === "directory" ? `${name}/` : name;
    });
  };

  pathExists = (path: string): boolean => {
    return this.navigatePath(path) !== null;
  };

  isDirectory = (path: string): boolean => {
    const item = this.navigatePath(path);
    return item !== null && item.type === "directory";
  };

  isFile = (path: string): boolean => {
    const item = this.navigatePath(path);
    return item !== null && item.type === "file";
  };

  getFileContent = (path: string): string | null => {
    const item = this.navigatePath(path);
    if (!item || item.type !== "file") return null;
    return item.content || null;
  };

  resolvePath = (currentPath: string, relativePath: string): string => {
    if (relativePath.startsWith("/")) {
      return relativePath;
    }

    if (relativePath === "..") {
      const parts = currentPath.split("/").filter(Boolean);
      parts.pop();
      return parts.length > 0 ? `/${parts.join("/")}` : "/";
    }

    return `${currentPath}/${relativePath}`.replace("//", "/");
  };

  getParentPath = (path: string): string => {
    if (path === "/") return "/";
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return parts.length > 0 ? `/${parts.join("/")}` : "/";
  };

  getBasename = (path: string): string => {
    if (path === "/") return "/";
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1] || "/";
  };
}

export const fsNavigator = new FileSystemNavigator(fileSystem);

export class ShellCommandHandler {
  private navigator: FileSystemNavigator;

  constructor(navigator: FileSystemNavigator) {
    this.navigator = navigator;
  }

  handleLs = (args: string[], currentPath: string): string[] => {
    const targetPath = args[0]
      ? this.navigator.resolvePath(currentPath, args[0])
      : currentPath;

    const contents = this.navigator.getDirectoryContents(targetPath);

    if (contents.length === 0) {
      if (!this.navigator.pathExists(targetPath)) {
        return [`ls: cannot access '${targetPath}': No such file or directory`];
      }
      if (this.navigator.isFile(targetPath)) {
        return [`ls: cannot access '${targetPath}': Not a directory`];
      }
      return ["(empty directory)"];
    }

    return contents;
  };

  handleCd = (
    args: string[],
    currentPath: string,
    setCurrentPath: (path: string) => void
  ): string[] => {
    if (!args[0]) {
      setCurrentPath("/home/aathish");
      return [];
    }

    if (args[0] === "..") {
      const newPath = this.navigator.getParentPath(currentPath);
      setCurrentPath(newPath);
      return [];
    }

    const targetPath = this.navigator.resolvePath(currentPath, args[0]);

    if (!this.navigator.pathExists(targetPath)) {
      return [`cd: no such file or directory: ${args[0]}`];
    }

    if (!this.navigator.isDirectory(targetPath)) {
      return [`cd: not a directory: ${args[0]}`];
    }

    setCurrentPath(targetPath);
    return [];
  };

  handleCat = (args: string[], currentPath: string): string[] => {
    if (!args[0]) {
      return ["cat: missing file name"];
    }

    const filePath = this.navigator.resolvePath(currentPath, args[0]);

    if (!this.navigator.pathExists(filePath)) {
      return [`cat: ${args[0]}: No such file or directory`];
    }

    if (this.navigator.isDirectory(filePath)) {
      return [`cat: ${args[0]}: Is a directory`];
    }

    const content = this.navigator.getFileContent(filePath);
    return content ? content.split("\n") : ["(empty file)"];
  };

  handleEcho = (args: string[]): string[] => {
    return [args.join(" ")];
  };

  handlePwd = (currentPath: string): string[] => {
    return [currentPath];
  };

  handleShellCommand = (
    command: string,
    args: string[],
    currentPath: string,
    setCurrentPath: (path: string) => void
  ): string[] => {
    switch (command) {
      case "ls":
        return this.handleLs(args, currentPath);
      case "cd":
        return this.handleCd(args, currentPath, setCurrentPath);
      case "cat":
        return this.handleCat(args, currentPath);
      case "echo":
        return this.handleEcho(args);
      case "pwd":
        return this.handlePwd(currentPath);
      default:
        return [`${command}: command not found`];
    }
  };
}

export const shellHandler = new ShellCommandHandler(fsNavigator);
