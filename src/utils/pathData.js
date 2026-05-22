const pathStartPattern = /^[Mm]\s*-?\d/

export const isPathData = (value) => (
  typeof value === 'string' && pathStartPattern.test(value.trim())
)

export const splitPathData = (value) => {
  const pathData = String(value || '').trim()
  if (!isPathData(pathData)) return []

  const moveIndexes = []
  const movePattern = /M(?=\s*[-+.\d])/g
  let match = movePattern.exec(pathData)

  while (match) {
    moveIndexes.push(match.index)
    match = movePattern.exec(pathData)
  }

  if (moveIndexes.length <= 1) return [pathData]

  return moveIndexes
    .map((start, index) => {
      const end = moveIndexes[index + 1] ?? pathData.length
      return pathData.slice(start, end).trim()
    })
    .filter(Boolean)
}

export const splitPathItem = (path) => {
  const parts = splitPathData(path?.d)
  if (!parts.length) return []
  return parts.map((d) => ({ ...path, d }))
}

export const normalizePathItems = (paths) => {
  if (!Array.isArray(paths)) return []
  return paths.flatMap((path) => splitPathItem(path))
}
