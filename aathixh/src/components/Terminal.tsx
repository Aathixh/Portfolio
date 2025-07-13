import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/Terminal.css";

interface Command {
  input: string;
  output: string[];
  isComplete?: boolean;
}

interface FileSystemItem {
  type: "file" | "directory";
  content?: string;
  children?: { [key: string]: FileSystemItem };
}

interface FileSystem {
  [key: string]: FileSystemItem;
}

const Terminal: React.FC = () => {
  const [history, setHistory] = useState<Command[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentPath, setCurrentPath] = useState("/home/aathish");
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentTypingCommand, setCurrentTypingCommand] = useState<
    number | null
  >(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef<number | null>(null);

  // File system structure
  const fileSystem: FileSystem = {
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

  const commands = {
    help: [
      "Available commands:",
      "",
      "Navigation Commands:",
      "  ls              - List directory contents",
      "  cd <directory>  - Change directory",
      "  cd ..           - Go to parent directory",
      "  pwd             - Print working directory",
      "  cat <file>      - Display file contents",
      "",
      "Portfolio Commands:",
      "  about           - Learn about me",
      "  skills          - View my technical skills",
      "  projects        - See my projects",
      "  experience      - View my work experience",
      "  education       - My educational background",
      "  contact         - Get my contact information",
      "  social          - My social media links",
      "",
      "System Commands:",
      "  clear           - Clear the terminal",
      "  whoami          - Display current user",
      "  date            - Show current date and time",
      "  echo <text>     - Display text",
    ],
    about: [
      "Hi! I'm Aathish 👋",
      "",
      "I'm a passionate Full Stack Developer with expertise in modern web technologies.",
      "I love creating innovative solutions and building user-friendly applications.",
      "",
      "Current focus: React, TypeScript, Node.js, and 3D web experiences",
      "Location: [Your Location]",
      "Status: Available for opportunities",
      "",
      "Fun fact: I enjoy combining creativity with code to build immersive experiences!",
    ],
    skills: [
      "Technical Skills Overview:",
      "",
      "🎨 Frontend Development:",
      "  • React, Next.js, TypeScript",
      "  • HTML5, CSS3, SASS/SCSS",
      "  • Three.js, React Three Fiber",
      "  • Tailwind CSS, Styled Components",
      "  • Responsive Design, PWAs",
      "",
      "⚙️ Backend Development:",
      "  • Node.js, Express.js",
      "  • Python, Django, FastAPI",
      "  • RESTful APIs, GraphQL",
      "  • Microservices Architecture",
      "",
      "🗄️ Database Technologies:",
      "  • MongoDB, PostgreSQL",
      "  • MySQL, Redis",
      "  • Database Design & Optimization",
      "",
      "🛠️ Tools & Technologies:",
      "  • Git, Docker, Kubernetes",
      "  • AWS, GCP, Vercel",
      "  • CI/CD, Jest, Cypress",
      "  • Figma, Adobe Creative Suite",
      "",
      "💡 Currently Learning:",
      "  • WebGL, WASM",
      "  • Machine Learning with TensorFlow",
      "  • Blockchain Development",
    ],
    projects: [
      "Featured Projects:",
      "",
      "🌟 Interactive 3D Portfolio (Current)",
      "  • Technologies: React, Three.js, TypeScript, React Three Fiber",
      "  • Features: Real-time physics simulation, Interactive terminal",
      "  • Challenge: Creating immersive 3D web experiences",
      "",
      "🛒 E-Commerce Platform",
      "  • Technologies: MERN Stack, Stripe API, JWT",
      "  • Features: Payment integration, Admin dashboard, Real-time inventory",
      "  • Users: 1000+ active users, 99.9% uptime",
      "",
      "📋 Collaborative Task Manager",
      "  • Technologies: React, Socket.io, Node.js, MongoDB",
      "  • Features: Real-time collaboration, Drag & drop, Team management",
      "  • Performance: 40% faster than competitor solutions",
      "",
      "🎮 WebGL Game Engine",
      "  • Technologies: WebGL, TypeScript, Web Workers",
      "  • Features: 3D rendering, Physics simulation, Asset management",
      "  • Status: Open source project with 500+ stars",
      "",
      "Type 'cd projects' to explore project files!",
    ],
    experience: [
      "Professional Experience:",
      "",
      "🏢 Senior Full Stack Developer @ TechCorp",
      "  📅 Jan 2023 - Present",
      "  🎯 Lead development of cloud-native applications",
      "  📈 Improved system performance by 45%",
      "  👥 Mentored 3 junior developers",
      "  🔧 Stack: React, Node.js, AWS, Docker",
      "",
      "💻 Frontend Developer @ StartupXYZ",
      "  📅 Jun 2021 - Dec 2022",
      "  🎯 Built responsive web applications from scratch",
      "  📱 Implemented mobile-first design strategies",
      "  🚀 Reduced load times by 60%",
      "  🔧 Stack: Vue.js, TypeScript, SASS",
      "",
      "🎓 Junior Developer @ WebSolutions",
      "  📅 Sep 2020 - May 2021",
      "  🎯 Contributed to 10+ client projects",
      "  📚 Learned modern development practices",
      "  🤝 Collaborated with design and QA teams",
      "  🔧 Stack: JavaScript, PHP, MySQL",
    ],
    education: [
      "Educational Background:",
      "",
      "🎓 Bachelor of Computer Science",
      "  🏫 University of Technology",
      "  📅 2017 - 2021",
      "  🏆 Magna Cum Laude (GPA: 3.8/4.0)",
      "  📚 Relevant Coursework:",
      "    • Data Structures & Algorithms",
      "    • Database Management Systems",
      "    • Software Engineering",
      "    • Computer Graphics",
      "    • Machine Learning",
      "",
      "📜 Certifications:",
      "  🌐 AWS Certified Developer - Associate (2023)",
      "  ⚛️ React Professional Certification (2022)",
      "  🐳 Docker Certified Associate (2022)",
      "  📊 Google Analytics Certified (2021)",
      "",
      "🏆 Achievements:",
      "  • Dean's List (4 semesters)",
      "  • Best Final Year Project Award",
      "  • Hackathon Winner (University Tech Fest 2021)",
    ],
    contact: [
      "📬 Contact Information:",
      "",
      "📧 Email: aathish.dev@example.com",
      "📱 Phone: +1 (555) 123-4567",
      "💼 LinkedIn: linkedin.com/in/aathish-dev",
      "🐙 GitHub: github.com/aathish-dev",
      "🌐 Portfolio: aathish.dev",
      "📍 Location: San Francisco, CA",
      "",
      "💬 Preferred Contact Methods:",
      "  • Email (Professional inquiries)",
      "  • LinkedIn (Networking)",
      "  • GitHub (Technical discussions)",
      "",
      "⏰ Response Time: Within 24 hours",
      "🌍 Available for: Remote, Hybrid, or On-site opportunities",
      "",
      "Feel free to reach out for collaborations, opportunities, or just to say hi! 👋",
    ],
    social: [
      "🌐 Social Media & Professional Links:",
      "",
      "💻 Professional:",
      "  🐙 GitHub: github.com/aathish-dev",
      "  💼 LinkedIn: linkedin.com/in/aathish-dev",
      "  📝 Medium: medium.com/@aathish-dev",
      "  🌟 Portfolio: aathish.dev",
      "",
      "📱 Social:",
      "  🐦 Twitter: @aathish_dev",
      "  📷 Instagram: @aathish.codes",
      "  📺 YouTube: Aathish Codes",
      "",
      "🎯 Tech Communities:",
      "  💬 Discord: AathishDev#1234",
      "  🗣️ Stack Overflow: stackoverflow.com/users/aathish",
      "  🏆 Codepen: codepen.io/aathish-dev",
      "",
      "📊 Stats:",
      "  • 50+ GitHub repositories",
      "  • 1000+ LinkedIn connections",
      "  • 500+ Twitter followers",
      "  • 100+ Medium article reads",
    ],
    whoami: ["aathish"],
    pwd: () => [currentPath],
    date: () => [new Date().toString()],
    clear: [],
  };

  // Navigate through file system
  const navigatePath = (path: string): FileSystemItem | null => {
    if (path === "/") return fileSystem["/"];

    const parts = path.split("/").filter(Boolean);
    let current = fileSystem["/"];

    for (const part of parts) {
      if (current?.children?.[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }

    return current;
  };

  // Get directory contents
  const getDirectoryContents = (path: string): string[] => {
    const dir = navigatePath(path);
    if (!dir || dir.type !== "directory") return [];

    return Object.entries(dir.children || {}).map(([name, item]) => {
      return item.type === "directory" ? `${name}/` : name;
    });
  };

  // Handle shell commands
  const handleShellCommand = (command: string, args: string[]): string[] => {
    switch (command) {
      case "ls": {
        const targetPath = args[0]
          ? args[0].startsWith("/")
            ? args[0]
            : `${currentPath}/${args[0]}`.replace("//", "/")
          : currentPath;
        const contents = getDirectoryContents(targetPath);
        if (contents.length === 0) {
          const dir = navigatePath(targetPath);
          if (!dir)
            return [
              `ls: cannot access '${targetPath}': No such file or directory`,
            ];
          if (dir.type === "file")
            return [`ls: cannot access '${targetPath}': Not a directory`];
          return ["(empty directory)"];
        }
        return contents;
      }

      case "cd": {
        if (!args[0]) {
          setCurrentPath("/home/aathish");
          return [];
        }

        if (args[0] === "..") {
          const parts = currentPath.split("/").filter(Boolean);
          parts.pop();
          const newPath = parts.length > 0 ? `/${parts.join("/")}` : "/";
          setCurrentPath(newPath);
          return [];
        }

        const targetPath = args[0].startsWith("/")
          ? args[0]
          : `${currentPath}/${args[0]}`.replace("//", "/");
        const dir = navigatePath(targetPath);

        if (!dir) {
          return [`cd: no such file or directory: ${args[0]}`];
        }

        if (dir.type !== "directory") {
          return [`cd: not a directory: ${args[0]}`];
        }

        setCurrentPath(targetPath);
        return [];
      }

      case "cat": {
        if (!args[0]) {
          return ["cat: missing file name"];
        }

        const filePath = args[0].startsWith("/")
          ? args[0]
          : `${currentPath}/${args[0]}`.replace("//", "/");
        const file = navigatePath(filePath);

        if (!file) {
          return [`cat: ${args[0]}: No such file or directory`];
        }

        if (file.type === "directory") {
          return [`cat: ${args[0]}: Is a directory`];
        }

        return file.content ? file.content.split("\n") : ["(empty file)"];
      }

      case "echo": {
        return [args.join(" ")];
      }

      case "pwd": {
        return [currentPath];
      }

      default:
        return [`${command}: command not found`];
    }
  };

  // Typing effect function
  const startTypingEffect = useCallback(
    (commandIndex: number, output: string[]) => {
      setIsTyping(true);
      setCurrentTypingCommand(commandIndex);
      setTypingIndex(0);

      const fullText = output.join("\n");
      let currentIndex = 0;

      const typeChar = () => {
        if (currentIndex < fullText.length) {
          setTypingIndex(currentIndex + 1);
          currentIndex++;
          typingRef.current = setTimeout(
            typeChar,
            Math.random() * 20 + 10
          ) as unknown as number; // Random typing speed
        } else {
          setIsTyping(false);
          setCurrentTypingCommand(null);
          setTypingIndex(0);

          // Mark command as complete
          setHistory((prev) =>
            prev.map((cmd, idx) =>
              idx === commandIndex ? { ...cmd, isComplete: true } : cmd
            )
          );
        }
      };

      typeChar();
    },
    []
  );

  // Stop typing effect
  const stopTypingEffect = () => {
    if (typingRef.current) {
      clearTimeout(typingRef.current);
      typingRef.current = null;
    }
    setIsTyping(false);
    setCurrentTypingCommand(null);
    setTypingIndex(0);
  };

  // Handle command execution
  const handleCommand = (command: string) => {
    const [cmd, ...args] = command.toLowerCase().trim().split(" ");

    if (cmd === "clear") {
      stopTypingEffect();
      setHistory([]);
      return;
    }

    let output: string[] = [];

    // Check if it's a shell command
    if (["ls", "cd", "cat", "echo", "pwd"].includes(cmd)) {
      output = handleShellCommand(cmd, args);
    } else if (cmd === "date") {
      output = [new Date().toString()];
    } else if (cmd === "whoami") {
      output = ["aathish"];
    } else {
      // Check predefined commands
      const commandFunction = commands[cmd as keyof typeof commands];
      if (typeof commandFunction === "function") {
        output = commandFunction();
      } else if (commandFunction) {
        output = commandFunction;
      } else {
        output = [
          `${cmd}: command not found`,
          "Type 'help' to see available commands.",
        ];
      }
    }

    const newCommand: Command = {
      input: command,
      output,
      isComplete: false,
    };

    const newIndex = history.length;
    setHistory((prev) => [...prev, newCommand]);

    // Start typing effect if output exists
    if (output.length > 0) {
      setTimeout(() => startTypingEffect(newIndex, output), 100);
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

  // Rest of your existing useEffects and handlers...
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
      },
    ]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history, typingIndex]);

  useEffect(() => {
    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
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
        <div className="terminal-title">Aathish's Portfolio Terminal</div>
      </div>

      <div className="terminal-body" ref={terminalRef}>
        {history.map((command, index) => (
          <div key={index} className="command-block">
            {command.input && (
              <div className="command-input">
                <span className="prompt">{getPrompt()} </span>
                <span className="input-text">{command.input}</span>
              </div>
            )}
            <div className="command-output">
              {command.output.map((line, lineIndex) => {
                // Show typing effect only for current command
                if (index === currentTypingCommand && !command.isComplete) {
                  const fullText = command.output.join("\n");
                  const displayText = fullText.substring(0, typingIndex);
                  const lines = displayText.split("\n");

                  return lines.map((typedLine, typedIndex) => (
                    <div
                      key={`${lineIndex}-${typedIndex}`}
                      className="output-line"
                    >
                      {typedLine}
                      {typedIndex === lines.length - 1 && (
                        <span className="typing-cursor">_</span>
                      )}
                    </div>
                  ));
                }

                // Show complete output for finished commands
                if (command.isComplete || index !== currentTypingCommand) {
                  return (
                    <div key={lineIndex} className="output-line">
                      {line}
                    </div>
                  );
                }

                return null;
              })}
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
