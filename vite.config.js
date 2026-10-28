import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Serve the Vercel serverless functions in `api/` during `vite dev`.
 *
 * In production Vercel routes `/api/admin/delete-user` to `api/admin/delete-user.js`.
 * Plain `vite` has no idea about that folder, so every admin action that POSTs to
 * `/api/...` (delete student, regrade tests) 404'd locally. This middleware mirrors
 * Vercel's Node runtime closely enough for those handlers: same `(req, res)` shape,
 * JSON bodies parsed into `req.body`, and server-only env (SUPABASE_SERVICE_ROLE_KEY)
 * loaded from `.env*` into `process.env` without leaking it to the client bundle.
 */
function vercelApiDev() {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root
      const apiDir = path.join(root, 'api')
      const env = loadEnv(server.config.mode, root, '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }

      const sendJson = (res, status, body) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      }

      const readBody = (req) => new Promise((resolve, reject) => {
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('error', reject)
        req.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8')
          if (!raw) return resolve(undefined)
          const type = String(req.headers['content-type'] || '')
          if (!type.includes('application/json')) return resolve(raw)
          try { resolve(JSON.parse(raw)) } catch { resolve(raw) } // handler reports invalid JSON itself
        })
      })

      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://localhost').pathname
        if (!pathname.startsWith('/api/')) return next()

        const file = path.resolve(apiDir, pathname.slice('/api/'.length) + '.js')
        if (!file.startsWith(apiDir + path.sep) || !fs.existsSync(file)) {
          return sendJson(res, 404, { error: `No API route for ${pathname}` })
        }

        try {
          const id = '/' + path.relative(root, file).split(path.sep).join('/')
          const mod = await server.ssrLoadModule(id)
          if (typeof mod.default !== 'function') {
            return sendJson(res, 500, { error: `${id} has no default export handler` })
          }
          req.body = await readBody(req)
          await mod.default(req, res)
        } catch (e) {
          console.error(`[vercel-api-dev] ${pathname} failed:`, e)
          if (!res.headersSent) sendJson(res, 500, { error: 'Server error' })
          else res.end()
        }
      })
    },
  }
}

export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [react(), vercelApiDev()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('three') || id.includes('@react-three')) return 'three'
        }
      }
    }
  },
})
