// app/layout.tsx
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Sistema CRM | Compina S.A.C.",
  description:
    "Sistema CRM para gestión de clientes de Compina con capacidad de gestión de 6000 clientes en tiempo real.",
  authors: [{ name: "Gabriel Polack" }],
  openGraph: {
    title: "Sistema CRM | Compina S.A.C.",
    description:
      "Sistema CRM para gestión de clientes de Compina con capacidad de gestión de 6000 clientes en tiempo real.",
    url: "https://sistema-crm-compina.vercel.app/",
    siteName: "Sistema CRM | Compina",
    images: [
      {
        url: "https://i.imgur.com/RYfsVS9.png",
        width: 1200,
        height: 630,
        alt: "Sistema CRM",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema CRM | Compina S.A.C.",
    description:
      "Sistema CRM para gestión de clientes de Compina con capacidad de gestión de 6000 clientes en tiempo real.",
    images: ["https://i.imgur.com/RYfsVS9.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={poppins.variable}>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}