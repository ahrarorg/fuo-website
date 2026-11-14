export const DEPARTMENT_SLUGS = [
  "talent",
  "peace",
  "sustainability",
  "technology",
  "organization",
  "security",
  "rights",
  "media",
  "capital",
  "partnerships",
] as const;

export type DepartmentSlug = (typeof DEPARTMENT_SLUGS)[number];

export const DEPARTMENT_HUES: Record<DepartmentSlug, string> = {
  talent: "#e8b84b",
  peace: "#86c66b",
  sustainability: "#3ed598",
  technology: "#38d6e0",
  organization: "#5b8cff",
  security: "#9d7bff",
  rights: "#ff5a6e",
  media: "#f06bd8",
  capital: "#ffb224",
  partnerships: "#2dd4bf",
};