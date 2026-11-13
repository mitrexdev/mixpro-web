"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Film, Menu, X } from "lucide-react";
import RequestDialog from "./request-dialog";
import SearchTrigger from "./search-trigger";
import ThemeToggle from "./theme-toggle";
import SearchDialog from "./search-dialog";
export default function Header({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="wordmark" href="/">
          <Film size={22} />
          {name.toLowerCase()}
          <span>Watch</span>
        </Link>
        <nav
          className={open ? "site-nav open" : "site-nav"}
          aria-label="Main navigation"
          id="public-navigation"
        >
          <Link
            href="/browse"
            aria-current={pathname === "/browse" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Explore
          </Link>
          <Link
            href="/about"
            aria-current={pathname === "/about" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            About
          </Link>
          <RequestDialog />
        </nav>
        <div className="nav-actions">
          <SearchTrigger compact />
          <ThemeToggle />
          <button
            className="icon-button mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="public-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <SearchDialog />
    </header>
  );
}
