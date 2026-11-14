import { Reveal } from "@/components/motion/Reveal";

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-champagne/8">
      <div className="aurora absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="shell relative pb-14 pt-[calc(var(--nav-h)+4.5rem)]">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="h1 mt-4 text-ivory">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={200}>
            <p className="lead mt-5 max-w-2xl text-muted">{lead}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}