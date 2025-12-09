import React from "react";

interface PageHeaderProps {
  title: string;
  /**
   * Optional content to display on the right side of the header.
   * Useful for panel toggles, filters, or action buttons.
   *
   * Example for Calendar:
   * rightContent={<CalendarFilters />}
   *
   * Example for Goals:
   * rightContent={<AddGoalButton />}
   */
  rightContent?: React.ReactNode;
}

const PageHeader = ({ title, rightContent }: PageHeaderProps) => {
  return (
    <div className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="w-full px-4 xl:px-8 h-14 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-100">{title}</h1>
        {rightContent && (
          <div className="flex items-center gap-2">{rightContent}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
