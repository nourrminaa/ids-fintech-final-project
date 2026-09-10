import { useEffect } from 'react'

// sets the tab title and meta description for whichever page calls it,
// since this is a single page app and there's no server rendering a
// different <head> per route
export default function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} - IDS Products Portal`

    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', description)
  }, [title, description])
}
