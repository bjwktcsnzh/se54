import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'

const pages = import.meta.glob('/src/pages/**/*.tsx')

function pathToRoute(filepath: string): string {
  let route = filepath
    .replace('/src/pages/', '/')
    .replace(/\.tsx$/, '')
    .replace(/\/index$/, '/')
    .replace(/\[(\w+)\]/g, ':$1')
  if (!route.startsWith('/')) route = '/' + route
  return route
}

export function createFileSystemRoutes(): RouteObject[] {
  const routes: RouteObject[] = []

  for (const [filepath, importFn] of Object.entries(pages)) {
    const path = pathToRoute(filepath)
    const LazyPage = lazy(importFn as () => Promise<{ default: React.ComponentType }>)

    routes.push({
      path,
      element: (
        <Suspense fallback={<div className="page-loading">Loading...</div>}>
          <LazyPage />
        </Suspense>
      ),
    })
  }

  return routes
}
