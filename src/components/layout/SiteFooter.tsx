import { APP } from "@/constants/app";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="container-site flex flex-col gap-1 py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {APP.name}
        </p>
        <p>{APP.tagline}</p>
      </div>
    </footer>
  );
}
