/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'

const nextConfig = {
    output: isDev ? undefined : 'export',
    basePath: isDev ? undefined : '/700A7525-9F6D-4351-8ABF-0E68CB9CFB9E',
}

module.exports = nextConfig
