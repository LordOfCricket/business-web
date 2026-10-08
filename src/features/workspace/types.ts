export type WorkspaceKind =
  | "ACADEMY"
  | "VENUE"
  | "COACH"
  | "OFFICIAL"
  | "SPORTS_CENTER"
  | "CLUB"
  | "TOURNAMENT"
  | "SHOP";

export interface WorkspaceSummary {
  id: string;
  kind: WorkspaceKind;
  title: string;
  entityName: string;
  sport: string;
  sportDisciplines?: string[];
  metrics: Array<{ label: string; value: string }>;
  status: "ACTIVE" | "PENDING_VERIFICATION" | "DRAFT" | "VERIFIED";
  href: string;
  role: string;
  iconName: string;
  tagline: string;
  branchCount?: number;
}

export interface WorkspaceGroup {
  category: string;
  workspaces: WorkspaceSummary[];
}
