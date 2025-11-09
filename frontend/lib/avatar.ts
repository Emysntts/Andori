const PROFILE_AVATAR_IMAGES = ['/perfil1.png', '/perfil2.png', '/perfil3.png'] as const

export type AvatarIdentifier = string | number | null | undefined

function hashToPoolIndex(identifier: AvatarIdentifier, poolSize: number): number {
  if (!identifier || poolSize === 0) {
    return 0
  }
  const str = String(identifier)
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash + str.charCodeAt(i)) % poolSize
  }
  return Math.abs(hash) % poolSize
}

export function selectProfileAvatar(identifier: AvatarIdentifier): string {
  const pool = PROFILE_AVATAR_IMAGES
  if (!identifier) {
    return pool[0]
  }

  return pool[hashToPoolIndex(identifier, pool.length)]
}

export function selectTurmaAvatar(identifier: AvatarIdentifier): string {
  return selectProfileAvatar(identifier)
}

