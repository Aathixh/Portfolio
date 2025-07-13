import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/Terminal.css";
import { shellHandler } from "../data/fileSystem";
import { CommandHandler } from "../data/commands";

interface Command {
  input: string;
  output: string[];
  isComplete?: boolean;
  typedOutput?: string[];
  prompt?: string; // Store the prompt when command was executed
}

const Terminal: React.FC = () => {
  const [history, setHistory] = useState<Command[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentPath, setCurrentPath] = useState("/home/aathish");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Get all available commands for autocompletion
  const getAllCommands = () => {
    const shellCommands = ["ls", "cd", "cat", "echo", "pwd"];
    const portfolioCommands = CommandHandler.getCommandNames().filter(
      (cmd) => cmd !== "clear"
    ); // Exclude clear from portfolio commands
    const systemCommands = ["date", "whoami", "clear"];

    // Combine all commands and remove duplicates
    const allCommands = [
      ...shellCommands,
      ...portfolioCommands,
      ...systemCommands,
    ];
    return [...new Set(allCommands)]; // Remove duplicates using Set
  };

  // Create a function to get directory contents (workaround for private access)
  const getDirectoryContents = (path: string): string[] => {
    // Use the shell handler's ls command to get directory contents
    const output = shellHandler.handleShellCommand("ls", [], path, () => {});
    if (
      output.length === 1 &&
      output[0].includes("No such file or directory")
    ) {
      return [];
    }
    return output;
  };

  // Autocompletion function
  const handleTabCompletion = () => {
    const trimmedInput = currentInput.trim();
    if (!trimmedInput) return;

    const words = trimmedInput.split(" ");
    const currentWord = words[words.length - 1];

    if (words.length === 1) {
      // Complete command names
      const allCommands = getAllCommands();
      const matches = allCommands.filter((cmd) =>
        cmd.toLowerCase().startsWith(currentWord.toLowerCase())
      );

      if (matches.length === 1) {
        setCurrentInput(matches[0] + " ");
      } else if (matches.length > 1) {
        // Find common prefix for partial completion
        const commonPrefix = matches.reduce((prefix, match) => {
          let common = "";
          for (let i = 0; i < Math.min(prefix.length, match.length); i++) {
            if (prefix[i].toLowerCase() === match[i].toLowerCase()) {
              common += prefix[i];
            } else {
              break;
            }
          }
          return common;
        });

        // If we can complete more characters, do partial completion
        if (commonPrefix.length > currentWord.length) {
          setCurrentInput(commonPrefix);
        } else {
          // Show available options in terminal output without command prompt
          const newCommand: Command = {
            input: "", // Empty input so no prompt is shown
            output: ["Available completions:", ...matches.sort()],
            isComplete: true,
            typedOutput: ["Available completions:", ...matches.sort()],
          };
          setHistory((prev) => [...prev, newCommand]);
        }
      }
    } else if (words[0] === "cd" && words.length === 2) {
      // Complete directory names for cd command
      const directories = getDirectoryContents(currentPath)
        .filter((item) => item.endsWith("/"))
        .map((dir) => dir.slice(0, -1)); // Remove trailing slash

      const matches = directories.filter((dir) =>
        dir.toLowerCase().startsWith(currentWord.toLowerCase())
      );

      if (matches.length === 1) {
        words[words.length - 1] = matches[0];
        setCurrentInput(words.join(" ") + " ");
      } else if (matches.length > 1) {
        // Find common prefix for partial completion
        const commonPrefix = matches.reduce((prefix, match) => {
          let common = "";
          for (let i = 0; i < Math.min(prefix.length, match.length); i++) {
            if (prefix[i].toLowerCase() === match[i].toLowerCase()) {
              common += prefix[i];
            } else {
              break;
            }
          }
          return common;
        });

        // If we can complete more characters, do partial completion
        if (commonPrefix.length > currentWord.length) {
          words[words.length - 1] = commonPrefix;
          setCurrentInput(words.join(" "));
        } else {
          // Show available options
          const newCommand: Command = {
            input: "",
            output: ["Available directories:", ...matches.sort()],
            isComplete: true,
            typedOutput: ["Available directories:", ...matches.sort()],
          };
          setHistory((prev) => [...prev, newCommand]);
        }
      }
    } else if (words[0] === "cat" && words.length === 2) {
      // Complete file names for cat command
      const files = getDirectoryContents(currentPath).filter(
        (item) => !item.endsWith("/")
      );

      const matches = files.filter((file) =>
        file.toLowerCase().startsWith(currentWord.toLowerCase())
      );

      if (matches.length === 1) {
        words[words.length - 1] = matches[0];
        setCurrentInput(words.join(" ") + " ");
      } else if (matches.length > 1) {
        // Find common prefix for partial completion
        const commonPrefix = matches.reduce((prefix, match) => {
          let common = "";
          for (let i = 0; i < Math.min(prefix.length, match.length); i++) {
            if (prefix[i].toLowerCase() === match[i].toLowerCase()) {
              common += prefix[i];
            } else {
              break;
            }
          }
          return common;
        });

        // If we can complete more characters, do partial completion
        if (commonPrefix.length > currentWord.length) {
          words[words.length - 1] = commonPrefix;
          setCurrentInput(words.join(" "));
        } else {
          // Show available options
          const newCommand: Command = {
            input: "",
            output: ["Available files:", ...matches.sort()],
            isComplete: true,
            typedOutput: ["Available files:", ...matches.sort()],
          };
          setHistory((prev) => [...prev, newCommand]);
        }
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      handleTabCompletion();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (
        commandHistory.length > 0 &&
        historyIndex < commandHistory.length - 1
      ) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    }
  };

  // Typing effect function with proper line-by-line animation
  const startTypingEffect = useCallback(
    (commandIndex: number, commandOutput: string[]) => {
      console.log("Starting typing effect for command index:", commandIndex);
      console.log("Command output to type:", commandOutput);
      setIsTyping(true);

      if (!commandOutput || commandOutput.length === 0) {
        console.log("No command output, marking as complete");
        setIsTyping(false);
        setHistory((prev) =>
          prev.map((cmd, idx) =>
            idx === commandIndex ? { ...cmd, isComplete: true } : cmd
          )
        );
        return;
      }

      let lineIndex = 0;

      const typeLine = () => {
        setHistory((prev) => {
          const newHistory = [...prev];
          const currentCommand = { ...newHistory[commandIndex] };

          if (!currentCommand) {
            console.log("Command not found at index:", commandIndex);
            setIsTyping(false);
            return prev;
          }

          if (!currentCommand.typedOutput) {
            currentCommand.typedOutput = [];
          }

          if (lineIndex < commandOutput.length) {
            currentCommand.typedOutput.push(commandOutput[lineIndex]);
            newHistory[commandIndex] = currentCommand;
            lineIndex++;
            console.log(
              "Typed line:",
              lineIndex - 1,
              "of",
              commandOutput.length
            );

            typingTimeoutRef.current = window.setTimeout(typeLine, 80); // 80ms delay between lines
          } else {
            // Typing complete
            console.log("Typing complete for command:", commandIndex);
            currentCommand.isComplete = true;
            newHistory[commandIndex] = currentCommand;
            setIsTyping(false);
          }

          return newHistory;
        });
      };

      // Start typing with initial delay
      typingTimeoutRef.current = window.setTimeout(typeLine, 100);
    },
    []
  );

  // Stop typing effect
  const stopTypingEffect = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTyping) {
      setIsTyping(false);
      setHistory((prev) =>
        prev.map((cmd) =>
          !cmd.isComplete
            ? { ...cmd, typedOutput: cmd.output, isComplete: true }
            : cmd
        )
      );
    }
  };

  // Handle command execution
  const handleCommand = (command: string) => {
    console.log("Handling command:", command);
    const [cmd, ...args] = command.toLowerCase().trim().split(" ");

    if (cmd === "clear") {
      stopTypingEffect();
      setHistory([]);
      return;
    }

    let output: string[] = [];

    // Check if it's a shell command (handled by filesystem module)
    if (["ls", "cd", "cat", "echo", "pwd"].includes(cmd)) {
      console.log("Processing shell command:", cmd, "with args:", args);
      output = shellHandler.handleShellCommand(
        cmd,
        args,
        currentPath,
        setCurrentPath
      );
    } else if (cmd === "date") {
      output = [new Date().toString()];
    } else if (cmd === "whoami") {
      output = ["aathish"];
    } else {
      // Check predefined commands using CommandHandler
      const commandOutput = CommandHandler.handleCommand(cmd);
      if (commandOutput) {
        output = commandOutput;
      } else {
        output = [
          `${cmd}: command not found`,
          "Type 'help' to see available commands.",
        ];
      }
    }

    console.log("Command output:", output);

    const newCommand: Command = {
      input: command,
      output,
      isComplete: false,
      typedOutput: [],
      prompt: getPrompt(), // Store current prompt with the command
    };

    const newIndex = history.length;
    setHistory((prev) => [...prev, newCommand]);

    // Start typing effect if output exists
    if (output.length > 0) {
      setTimeout(() => startTypingEffect(newIndex, output), 50);
    } else {
      // Mark as complete immediately if no output
      setTimeout(() => {
        setHistory((prev) =>
          prev.map((cmd, idx) =>
            idx === newIndex ? { ...cmd, isComplete: true } : cmd
          )
        );
      }, 50);
    }
  };

  // Initialize with welcome message
  useEffect(() => {
    setHistory([
      {
        input: "",
        output: [
          "Welcome to Aathish's Interactive Portfolio Terminal! 🚀",
          "",
          "This is a fully functional shell-like interface.",
          "You can navigate through my portfolio using standard Unix commands.",
          "",
          "Try these commands to get started:",
          "• help     - See all available commands",
          "• about    - Learn about me",
          "• ls       - List contents of current directory",
          "• cd projects - Navigate to my projects folder",
          "",
          "Happy exploring! 🎯",
        ],
        isComplete: true,
        typedOutput: [
          "Welcome to Aathish's Interactive Portfolio Terminal! 🚀",
          "",
          "This is a fully functional shell-like interface.",
          "You can navigate through my portfolio using standard Unix commands.",
          "",
          "Try these commands to get started:",
          "• help     - See all available commands",
          "• about    - Learn about me",
          "• ls       - List contents of current directory",
          "• cd projects - Navigate to my projects folder",
          "",
          "Happy exploring! 🎯",
        ],
      },
    ]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      });
    }
  }, [history]);

  // Initial scroll to bottom after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = 0; // Reset scroll to top initially
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with input:", currentInput);
    if (currentInput.trim()) {
      // Add to command history
      setCommandHistory((prev) => [...prev, currentInput.trim()]);
      setHistoryIndex(-1); // Reset history index

      stopTypingEffect(); // Stop any ongoing typing
      handleCommand(currentInput.trim());
      setCurrentInput("");
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const getPrompt = () => {
    const user = "aathish";
    const hostname = "portfolio";
    const shortPath = currentPath === "/home/aathish" ? "~" : currentPath;
    return `${user}@${hostname}:${shortPath}$`;
  };

  return (
    <div className="terminal" onClick={focusInput}>
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="terminal-button close"></span>
          <span className="terminal-button minimize"></span>
          <span className="terminal-button maximize"></span>
        </div>
        <div className="terminal-title">Portfolio Terminal</div>
      </div>

      <div className="terminal-body" ref={terminalRef}>
        {history.map((command, index) => (
          <div key={index} className="command-block">
            {command.input && (
              <div className="command-input">
                <span className="prompt">{command.prompt || getPrompt()} </span>
                <span className="input-text">{command.input}</span>
              </div>
            )}
            <div className="command-output">
              {(command.typedOutput || []).map((line, lineIndex) => {
                const isError =
                  line.includes("not found") ||
                  line.includes("error") ||
                  line.includes("Error") ||
                  line.includes("No such file") ||
                  line.includes("cannot access");

                return (
                  <div
                    key={lineIndex}
                    className={`output-line ${isError ? "error" : ""}`}
                  >
                    {line}
                  </div>
                );
              })}
              {isTyping &&
                !command.isComplete &&
                history[history.length - 1] === command && (
                  <span className="typing-cursor">_</span>
                )}
            </div>
          </div>
        ))}

        {!isTyping && (
          <form onSubmit={handleSubmit} className="input-form">
            <span className="prompt">{getPrompt()} </span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="terminal-input"
              autoFocus
              spellCheck={false}
              disabled={isTyping}
            />
          </form>
        )}
      </div>
    </div>
  );
};

export default Terminal;
