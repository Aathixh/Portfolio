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
                  "portfolio.md": {
                    type: "file",
                    content: "Interactive Portfolio using React and Three.js",
                  },
                  "ecommerce.md": {
                    type: "file",
                    content: "Full-stack E-commerce platform with MERN stack",
                  },
                  "task-manager.md": {
                    type: "file",
                    content: "Real-time collaborative task management app",
                  },
                },
              },
              skills: {
                type: "directory",
                children: {
                  "frontend.txt": {
                    type: "file",
                    content: "React, TypeScript, JavaScript, HTML5, CSS3",
                  },
                  "backend.txt": {
                    type: "file",
                    content: "Node.js, Express.js, Python, Django",
                  },
                  "database.txt": {
                    type: "file",
                    content: "MongoDB, PostgreSQL, MySQL",
                  },
                },
              },
              "about.txt": {
                type: "file",
                content:
                  "Full Stack Developer passionate about creating innovative solutions",
              },
              "contact.txt": {
                type: "file",
                content:
                  "Email: your.email@example.com\nLinkedIn: linkedin.com/in/yourprofile",
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

// Navigation utilities
export class FileSystemNavigator {
  private fileSystem: FileSystem;

  constructor(fileSystem: FileSystem) {
    this.fileSystem = fileSystem;
  }

  /**
   * Navigate to a specific path in the file system
   * @param path - The path to navigate to
   * @returns The FileSystemItem at the path, or null if not found
   */
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

  /**
   * Get the contents of a directory
   * @param path - The directory path
   * @returns Array of file/directory names, with directories suffixed with '/'
   */
  getDirectoryContents = (path: string): string[] => {
    const dir = this.navigatePath(path);
    if (!dir || dir.type !== "directory") return [];

    return Object.entries(dir.children || {}).map(([name, item]) => {
      return item.type === "directory" ? `${name}/` : name;
    });
  };

  /**
   * Check if a path exists
   * @param path - The path to check
   * @returns true if the path exists, false otherwise
   */
  pathExists = (path: string): boolean => {
    return this.navigatePath(path) !== null;
  };

  /**
   * Check if a path is a directory
   * @param path - The path to check
   * @returns true if the path is a directory, false otherwise
   */
  isDirectory = (path: string): boolean => {
    const item = this.navigatePath(path);
    return item !== null && item.type === "directory";
  };

  /**
   * Check if a path is a file
   * @param path - The path to check
   * @returns true if the path is a file, false otherwise
   */
  isFile = (path: string): boolean => {
    const item = this.navigatePath(path);
    return item !== null && item.type === "file";
  };

  /**
   * Get file content
   * @param path - The file path
   * @returns The file content or null if not found/not a file
   */
  getFileContent = (path: string): string | null => {
    const item = this.navigatePath(path);
    if (!item || item.type !== "file") return null;
    return item.content || null;
  };

  /**
   * Resolve a relative path to an absolute path
   * @param currentPath - The current working directory
   * @param relativePath - The relative path to resolve
   * @returns The absolute path
   */
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

  /**
   * Get parent directory path
   * @param path - The current path
   * @returns The parent directory path
   */
  getParentPath = (path: string): string => {
    if (path === "/") return "/";
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    return parts.length > 0 ? `/${parts.join("/")}` : "/";
  };

  /**
   * Get the basename of a path (last component)
   * @param path - The path
   * @returns The basename
   */
  getBasename = (path: string): string => {
    if (path === "/") return "/";
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1] || "/";
  };
}

// Create a default instance for easy import
export const fsNavigator = new FileSystemNavigator(fileSystem);

// Shell command handlers
export class ShellCommandHandler {
  private navigator: FileSystemNavigator;

  constructor(navigator: FileSystemNavigator) {
    this.navigator = navigator;
  }

  /**
   * Handle the 'ls' command
   * @param args - Command arguments
   * @param currentPath - Current working directory
   * @returns Command output lines
   */
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

  /**
   * Handle the 'cd' command
   * @param args - Command arguments
   * @param currentPath - Current working directory
   * @param setCurrentPath - Function to update current path
   * @returns Command output lines
   */
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

  /**
   * Handle the 'cat' command
   * @param args - Command arguments
   * @param currentPath - Current working directory
   * @returns Command output lines
   */
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

  /**
   * Handle the 'echo' command
   * @param args - Command arguments
   * @returns Command output lines
   */
  handleEcho = (args: string[]): string[] => {
    return [args.join(" ")];
  };

  /**
   * Handle the 'pwd' command
   * @param currentPath - Current working directory
   * @returns Command output lines
   */
  handlePwd = (currentPath: string): string[] => {
    return [currentPath];
  };

  /**
   * Handle any shell command
   * @param command - The command name
   * @param args - Command arguments
   * @param currentPath - Current working directory
   * @param setCurrentPath - Function to update current path
   * @returns Command output lines
   */
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

// Create a default instance for easy import
export const shellHandler = new ShellCommandHandler(fsNavigator);
