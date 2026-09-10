// theme preference is saved per person, not globally for the whole browser,
// otherwise two different people logging in on the same machine would keep
// overwriting each other's choice

const keyFor = (userId: number) => `ids_portal_theme:${userId}`

export function getSavedTheme(userId: number): 'light' | 'dark' | null {
  const saved = localStorage.getItem(keyFor(userId))
  return saved === 'light' || saved === 'dark' ? saved : null
}

export function saveTheme(userId: number, theme: 'light' | 'dark') {
  localStorage.setItem(keyFor(userId), theme)
}
