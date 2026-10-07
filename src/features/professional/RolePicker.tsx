"use client";

export interface SportRoles {
  slug: string;
  name: string;
  professionalTypes: Array<{ slug: string; name: string }>;
}

export type Role = { type: string; sport: string };

const key = (r: Role) => `${r.type}@${r.sport}`;

/** Pick one or more roles per sport (spec §8: a user can coach cricket and tennis and umpire cricket). */
export function RolePicker({
  sports,
  value,
  onChange,
}: {
  sports: SportRoles[];
  value: Role[];
  onChange: (roles: Role[]) => void;
}) {
  const selected = new Set(value.map(key));
  function toggle(role: Role, on: boolean) {
    onChange(on ? [...value, role] : value.filter((r) => key(r) !== key(role)));
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {sports.map((sport) => (
        <fieldset key={sport.slug} className="rounded-xl border border-line bg-surface p-4">
          <legend className="px-1 text-sm font-semibold">{sport.name}</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {sport.professionalTypes.map((t) => {
              const role = { type: t.slug, sport: sport.slug };
              return (
                <label key={t.slug} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(key(role))}
                    onChange={(e) => toggle(role, e.target.checked)}
                  />
                  {t.name}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
