import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function Sidebar({
  title = "Analysis",
  navItems = [],
  activePage,
  setActivePage,
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={`relative flex flex-col border-r border-border bg-card transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      {/* Toggle Button - Repositioned for better UX */}
      <button
        className="absolute -right-3 top-10 z-50 bg-background border border-border rounded-full p-1 shadow-md hover:text-primary transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
      </button>

      <div className="p-6 flex flex-col h-full">
        {/* Title Section */}
        <div className="h-12 flex items-center mb-8 overflow-hidden">
          <h2 className={`text-xl font-bold whitespace-nowrap transition-all duration-300 ${
            expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
          }`}>
            {title}
          </h2>
        </div>

        {/* Navigation List */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li
                key={item}
                onClick={() => setActivePage(item)}
                className={`group relative flex items-center cursor-pointer rounded-lg px-3 py-3 transition-all ${
                  activePage === item
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                title={!expanded ? item : undefined}
              >
                {/* Icon Placeholder (Initial of the name) */}
                <span className="flex-shrink-0 w-6 text-center font-mono font-bold">
                   {item[0]}
                </span>

                {/* Text Label */}
                <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                  expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                }`}>
                  {item}
                </span>

                {/* Active Indicator */}
                {activePage === item && (
                  <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;