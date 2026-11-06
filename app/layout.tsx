import type { Metadata } from "next";
import "./globals.css";
import Preloader from "./components/Preloader";

export const metadata: Metadata = { title: "My Portfolio" };

// Runs before the first paint, so there is no color flash.
// The random choice is saved for the whole browsing session.
const themeScript = `(function(){
  var themes = ['lime','cyan','magenta','orange'];
  var key = 'accent-theme';
  var t;
  try {
    t = sessionStorage.getItem(key);
    if (themes.indexOf(t) < 0) {
      t = themes[Math.floor(Math.random() * themes.length)];
      sessionStorage.setItem(key, t);
    }
  } catch (e) {
    t = t && themes.indexOf(t) > -1 ? t : 'cyan';
  }
  document.documentElement.setAttribute('data-accent', t);
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the script edits <html> before React starts
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* without JavaScript, never block the page with the preloader */}
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
