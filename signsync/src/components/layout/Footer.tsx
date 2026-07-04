import { Github, Linkedin, Twitter } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Container from "@/components/ui/Container";

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "How it works", "Accessibility", "Roadmap"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help center", "Community", "Sign language guide", "API docs"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-900/5 bg-beige-50">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-ink-500">
            SignSync turns sign language into text and speech in real time, so
            every conversation flows both ways.
          </p>
          <div className="flex items-center gap-3 pt-2">
            {[Twitter, Github, Linkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Social link"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900/5 text-ink-600 transition-colors hover:bg-signal-500 hover:text-white"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold text-ink-900">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-ink-500 transition-colors hover:text-signal-600"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t border-ink-900/5 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-sm text-ink-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} SignSync. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-signal-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-signal-600 transition-colors">Terms</a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
