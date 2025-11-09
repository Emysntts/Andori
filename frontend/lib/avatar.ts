const TURMA_AVATAR_IMAGES = ['/pfp1.png', '/pfp2.png', '/pfp3.png', '/pfp4.png'] as const

export type AvatarIdentifier = string | number | null | undefined

export function selectTurmaAvatar(identifier: AvatarIdentifier): string {
  const pool = TURMA_AVATAR_IMAGES
  if (!identifier) {
    return pool[0]
  }

  const str = String(identifier)
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash + str.charCodeAt(i)) % pool.length
  }
  return pool[Math.abs(hash) % pool.length]
}

