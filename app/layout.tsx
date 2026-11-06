import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "My Portfolio" };

// يعمل قبل رسم الصفحة => لا يوجد وميض. الاختيار يُحفظ طوال الجلسة.
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
    // suppressHydrationWarning: لأن السكربت يغيّر <html> قبل React
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
