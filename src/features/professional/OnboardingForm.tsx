"use client";

import { useState, useTransition } from "react";
import { Button, Input } from "@/components/ui";
import { onboardAction } from "./actions";
import { type Role, RolePicker, type SportRoles } from "./RolePicker";

export function OnboardingForm({ sports, defaultName }: { sports: SportRoles[]; defaultName?: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState(defaultName ?? "");
  const [city, setCity] = useState("");

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(undefined);
        start(async () => {
          const result = await onboardAction({ displayName: name, city, roles });
          if (result?.error) setError(result.error);
        });
      }}
    >
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Input
          label="Name shown to clients"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
      </div>
      <section aria-labelledby="roles-title" className="flex flex-col gap-3">
        <h2 id="roles-title" className="text-lg font-semibold">
          What do you do?
        </h2>
        <p className="text-sm text-muted">Pick every role you offer, for each sport.</p>
        <RolePicker sports={sports} value={roles} onChange={setRoles} />
      </section>
      <div>
        <Button type="submit" loading={pending}>
          Create my profile
        </Button>
      </div>
    </form>
  );
}
