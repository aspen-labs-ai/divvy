import Link from "next/link";
import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  backHref?: string;
  rightAction?: ReactNode;
}

export default function Header({ title, backHref, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#2a2a2a]">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="text-[#a1a1aa] hover:text-white transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 5L7.5 10L12.5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
          <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
        </div>
        {rightAction && <div className="flex-shrink-0 ml-3">{rightAction}</div>}
      </div>
    </header>
  );
}
