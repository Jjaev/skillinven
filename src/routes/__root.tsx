import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "스킬학교 — 한국 AI 스킬 마켓" },
      { name: "description", content: "누구나 AI 스킬을 배우고 바로 적용할 수 있는 곳. 설명 없이 복사해서 바로 됩니다." },
      { name: "author", content: "스킬학교" },
      { property: "og:title", content: "스킬학교 — 한국 AI 스킬 마켓" },
      { property: "og:description", content: "누구나 AI 스킬을 배우고 바로 적용할 수 있는 곳. 설명 없이 복사해서 바로 됩니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "스킬학교 — 한국 AI 스킬 마켓" },
      { name: "twitter:description", content: "누구나 AI 스킬을 배우고 바로 적용할 수 있는 곳. 설명 없이 복사해서 바로 됩니다." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0f656b21-d77d-4ccd-a9dc-221c269c8162/id-preview-7f567b76--dbfc3636-0363-474b-918a-6953ae2c79a0.lovable.app-1776952217992.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0f656b21-d77d-4ccd-a9dc-221c269c8162/id-preview-7f567b76--dbfc3636-0363-474b-918a-6953ae2c79a0.lovable.app-1776952217992.png" },
      { property: "og:site_name", content: "스킬학교" },
      { property: "og:locale", content: "ko_KR" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "스킬학교",
          alternateName: "Skill School Korea",
          url: "https://skillschoolkorea.lovable.app",
          inLanguage: "ko-KR",
          description: "한국 AI CLI(Claude · Codex · Gemini) 스킬 디렉토리. 검증된 한국어 AI 스킬을 찾고, 공유하고, 토론하세요.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://skillschoolkorea.lovable.app/directory?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
          publisher: {
            "@type": "Organization",
            name: "스킬학교",
            url: "https://skillschoolkorea.lovable.app",
          },
        }),
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
