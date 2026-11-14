import type { ReactNode } from "react";
import type { DepartmentSlug } from "@/lib/departments";

const paths: Record<DepartmentSlug, ReactNode> = {
  talent: (
    <>
      <circle cx="10" cy="8" r="3.2" />
      <path d="M4.5 19.5c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <path d="M18 3.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />
    </>
  ),
  peace: (
    <>
      <path d="M5 19c6-1 11-6 13-14" />
      <path d="M9.5 13.5c-2.5-.5-4-2.5-4-5 2.5 0 4.5 1.5 5 4" />
      <path d="M13 9.5c-.5-2.5.5-4.8 2.7-6 .8 2.4 0 4.7-2 6" />
      <circle cx="18.5" cy="17.5" r="2" />
    </>
  ),
  sustainability: (
    <>
      <path d="M12 20a8 8 0 0 1-7-11.5" />
      <path d="M12 4a8 8 0 0 1 7 11.5" />
      <path d="M4.5 5.5v3h3" />
      <path d="M19.5 18.5v-3h-3" />
      <path d="M12 15c-2-1.5-2-4.5 0-6 2 1.5 2 4.5 0 6z" />
    </>
  ),
  technology: (
    <>
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 9.4V4.5M12 14.6v4.9M9.4 12H4.5M14.6 12h4.9" />
      <circle cx="12" cy="3.6" r="1.1" />
      <circle cx="12" cy="20.4" r="1.1" />
      <circle cx="3.6" cy="12" r="1.1" />
      <circle cx="20.4" cy="12" r="1.1" />
    </>
  ),
  organization: (
    <>
      <rect x="4" y="4" width="6.4" height="6.4" rx="1.2" />
      <rect x="13.6" y="4" width="6.4" height="6.4" rx="1.2" />
      <rect x="4" y="13.6" width="6.4" height="6.4" rx="1.2" />
      <rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.2" fill="currentColor" fillOpacity="0.25" />
    </>
  ),
  security: (
    <>
      <path d="M12 3.5l7 2.6v5.2c0 4.6-3 7.6-7 9.2-4-1.6-7-4.6-7-9.2V6.1z" />
      <circle cx="12" cy="10.5" r="1.8" />
      <path d="M12 12.3v3.2" />
    </>
  ),
  rights: (
    <>
      <path d="M12 4v16M6 20h12" />
      <path d="M5 7h14" />
      <path d="M5 7l-2.4 5a2.8 2.8 0 0 0 4.8 0z" />
      <path d="M19 7l-2.4 5a2.8 2.8 0 0 0 4.8 0z" />
    </>
  ),
  media: (
    <>
      <circle cx="12" cy="12" r="1.8" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M6 6a8.5 8.5 0 0 0 0 12M18 6a8.5 8.5 0 0 1 0 12" />
    </>
  ),
  capital: (
    <>
      <ellipse cx="10" cy="7" rx="6" ry="2.6" />
      <path d="M4 7v5c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V7" />
      <path d="M4 12v5c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-5" />
      <path d="M19 10.5V4.8M16.8 7l2.2-2.2L21.2 7" />
    </>
  ),
  partnerships: (
    <>
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
      <path d="M12 3.2l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" />
    </>
  ),
};

export function DeptGlyph({
  slug,
  size = 28,
  className = "",
}: {
  slug: DepartmentSlug;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[slug]}
    </svg>
  );
}