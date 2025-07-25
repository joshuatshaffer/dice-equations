import { ReactNode } from "react";
import { usePageContext } from "vike-react/usePageContext";

export function Link({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const { urlPathname } = usePageContext();
  const isActive =
    href === "/" ? urlPathname === href : urlPathname.startsWith(href);
  return (
    <a href={href} className={isActive ? "is-active" : undefined}>
      {children}
    </a>
  );
}
