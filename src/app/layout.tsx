import './globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'A Time Manager',
    description: 'Help you to manage your time.',
}

export default function RootLayout({children,}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={'overflow-hidden'}>
        <body className={inter.className}>
        <div>Please enable javascript</div>
        {children}
        </body>
        </html>
    )
}
