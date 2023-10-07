
import Layout from "@/layouts/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({
  subsets: ['latin'],
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <main className={`${orbitron.className} w-screen h-screen`}>
        <Component {...pageProps} />
      </main>
    </Layout>
  );
}
