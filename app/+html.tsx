import { PropsWithChildren } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

export default function Html({ children }: PropsWithChildren) {
  return (
    <html lang="en-AU">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* No production brand icon has been selected. Avoid a missing favicon request. */}
        <link rel="icon" href="data:," />
        <title>Jigsaw Fun Time · Local preview</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
