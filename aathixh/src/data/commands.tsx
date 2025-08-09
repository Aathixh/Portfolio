// Terminal commands and their outputs
export const commands = {
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
    "I'm Aathish R Viswam. I am currently studying for a B.Tech in Electrical and Computer Engineering at Mar Baselios College of Engineering and Technology in Thiruvananthapuram. As a finalist in the Smart India Hackathon 2023, I've had the chance to push limits and face challenges on a national level.",
    "",
    "I am driven by curiosity, purpose, and a true passion for making an impact through innovation. Whether I'm brainstorming solutions, staying up late to tackle a tough problem, or watching an idea come to life, I thrive on that spark of possibility. I value teamwork, growth, and meaningful connections. I am always motivated by the opportunity to learn and to help others grow along the way.",
    "",
    "Location: Trivandrum, Kerala, India",
    "Status: Available for opportunities",
  ],
  skills: [
    "Technical Skills Overview:",
    "",
    "  • ReactNative, React JS, Laravel",
    "  • JavaScript, TypeScript, HTML5, CSS3, Python, Java, C",
    "  • MySQL, Supabase",
    "  • Git, GitHub, GitLab",
    "",
    "Currently Learning:",
    "  • AI/ML",
  ],
  projects: [
    "Featured Projects:",
    "",
    "Door Automation (Sep 2024 - Jul 2025)",
    "  • Technologies: React Native, IoT, Wi-Fi Integration",
    "  • Features: Remote door control, Smart setup process",
    "  • Impact: Enhanced privacy for differently-abled individuals",
    "  • GitHub: [github.com/Aathixh/ZenLock](https://github.com/Aathixh/ZenLock)",
    "",
    "EFDIN - Food Wastage Platform (Apr 2024 - May 2024)",
    "  • Technologies: PHP, Laravel, SQL, MVC, HTML5, CSS",
    "  • Features: Surplus food redistribution system",
    "  • Achievement: Built during DEFINE'24 Hackathon at MBCET",
    "  • GitHub: [github.com/Aathixh/EL](https://github.com/Aathixh/EL)",
    "",
    "OnRouteX - Bus Tracking System (Sep 2023 - Jan 2024)",
    "  • Technologies: PHP, Laravel, SQL, HTTP",
    "  • Features: Real-time Bus tracking, Booking system",
    "  • GitHub: [github.com/Aathixh/TrackBus](https://github.com/Aathixh/TrackBus)",
    "",
    "Type 'cd projects' to explore project files!",
  ],
  experience: [
    "Professional Experience:",
    "",
    "React Native Developer @ TheUrbanClub (Dec 2024 - Jun 2025)",
    "  • Developed a feature-rich mobile application using React Native, enhancing user engagement",
    "  • Collaborated with a team and followed agile methodologies for efficient development cycles",
    "",
    "Software Engineer @ Unibotix Innovations (Dec 2024 - Mar 2025)",
    "  • Contributed for web and mobile applications, improving functionality",
    "  • Fixed bugs and improved code quality for smooth application performance",
    "",
    "Software Developer Intern @ Mobatia Technologies (Oct 2023)",
    "  • Professional web development exposure using Laravel and PHP",
    "  • Built two CRUD applications with MySQL databases and HTML/CSS/JS interfaces",
  ],
  contact: [
    "Contact Information:",
    "",
    "Email: aathishrv@gmail.com",
    "LinkedIn: linkedin.com/in/aathishrviswam",
    "GitHub: github.com/aathixh",
    "Location: Trivandrum, Kerala, India",
    "",
    "Feel free to reach out for collaborations, opportunities, or just to say hi! 👋",
  ],
  whoami: ["aathish"],
  date: () => [new Date().toString()],
  clear: [],
  education: [
    "Education:",
    "",
    "Mar Baselios College Of Engineering and Technology",
    "  • BTech in Electrical and Computer",
    "",
    "Govt.Model Boys Higher Secondary School",
    "  • Maths and Computer Science (XIth and XIIth)",
    "",
    "Chinmaya Vidyalaya Attukal",
    "  • Xth Grade",
  ],
};

export class CommandHandler {
  static handleCommand(cmd: string): string[] | null {
    const commandFunction = commands[cmd as keyof typeof commands];

    if (typeof commandFunction === "function") {
      return commandFunction();
    } else if (commandFunction) {
      return commandFunction;
    }

    return null;
  }

  static commandExists(cmd: string): boolean {
    return cmd in commands;
  }

  static getCommandNames(): string[] {
    return Object.keys(commands);
  }
}

export default commands;
