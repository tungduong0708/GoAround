import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

interface HeaderProps {
  isAuthenticated: boolean
  displayName: string
}

export function useHeader(props: HeaderProps) {
  const profileLink = computed<RouteLocationRaw>(() =>
    props.isAuthenticated
      ? { name: 'profile' }
      : { name: 'login' }
  )

  const profileLabel = computed(() =>
    props.isAuthenticated ? props.displayName : 'Log in'
  )

  const profileSubtext = computed(() =>
    props.isAuthenticated ? 'View profile' : 'Access your trips'
  )

  const initials = computed(() => {
    const chunks = props.displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')

    return chunks.slice(0, 2).join('') || 'GA'
  })

  return {
    profileLink,
    profileLabel,
    profileSubtext,
    initials
  }
}
