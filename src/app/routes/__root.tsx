import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import appCss from "../styles.css?url";
import { AppLayout } from "@app/components/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@app/components/ui/sonner";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: AppLayout,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      {
        title: "Kwihome Os",
      },
    ],
    links: [
      // Preload self-hosted fonts for optimal performance
      {
        rel: "preload",
        as: "font",
        type: "font/ttf",
        href: "/fonts/Inter-VariableFont_opsz,wght.ttf",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/ttf",
        href: "/fonts/Outfit-VariableFont_wght.ttf",
        crossOrigin: "anonymous",
      },
      // Load app CSS (includes @font-face declarations)
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={Route.useRouteContext().queryClient}>
          {children}
        </QueryClientProvider>
        <Toaster position="top-center" />
        {/* <TanStackDevtools
          config={{
            position: "bottom-right",
            triggerHidden: true,
            openHotkey: "" as any,
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
        <Scripts />
      </body>
    </html>
  );
}
