import { Instagram } from "lucide-react";
import { Card } from "../ui/brand/Card";
import { instagramUrl, type Member } from "../../data/about";

type MemberCardProps = {
  member: Member;
};

export function MemberCard({ member }: MemberCardProps) {
  const headingId = `member-${member.instagram}`;
  return (
    <article aria-labelledby={headingId} className="h-full">
      <Card
        padding="md"
        className="flex h-full flex-col items-center text-center"
      >
        <img
          src={member.photo}
          alt={member.name}
          width={160}
          height={160}
          className="mb-5 h-32 w-32 rounded-full border border-border object-cover"
        />
        <span className="mb-1 font-display text-sm font-semibold uppercase tracking-widest text-brand">
          {member.role}
        </span>
        <h3
          id={headingId}
          className="font-display text-xl font-bold tracking-tight text-text-primary"
        >
          {member.name}
        </h3>
        <p className="mb-1 font-display text-text-secondary">
          {member.nickname}
        </p>
        <p className="mb-5 text-sm text-text-muted">{member.focus}</p>
        <a
          href={instagramUrl(member.instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 font-display text-sm font-semibold text-text-secondary transition-colors hover:text-brand"
        >
          <Instagram className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Instagram de {member.name}: </span>@
          {member.instagram}
        </a>
      </Card>
    </article>
  );
}
