import type {
  ResolvedTaskBarDecorations,
  ResolvedTaskBarIndicator,
  TaskBarDecorations,
  TaskBarLabelValue,
} from '../types/Types'

const normalizeLabelValue = (value: TaskBarLabelValue): string | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  const normalized = String(value).trim()
  return normalized ? normalized : undefined
}

const normalizeIndicator = (
  indicator: TaskBarDecorations['indicators'] extends Array<infer T> ? T : never,
  index: number
): ResolvedTaskBarIndicator | null => {
  if (!indicator) {
    return null
  }

  const text = normalizeLabelValue(indicator.text)
  if (!text) {
    return null
  }

  return {
    ...indicator,
    key: String(indicator.key ?? `indicator-${index}`),
    text,
  }
}

export const normalizeTaskBarDecorations = (
  decorations?: TaskBarDecorations | null
): ResolvedTaskBarDecorations => {
  const labels = decorations?.labels ?? {}
  const indicators = (decorations?.indicators ?? [])
    .map((indicator, index) => normalizeIndicator(indicator, index))
    .filter((indicator): indicator is ResolvedTaskBarIndicator => indicator !== null)

  return {
    labels: {
      left: normalizeLabelValue(labels.left),
      right: normalizeLabelValue(labels.right),
      top: normalizeLabelValue(labels.top),
      bottom: normalizeLabelValue(labels.bottom),
    },
    indicators,
  }
}

export const hasTaskBarDecorations = (decorations: ResolvedTaskBarDecorations): boolean => {
  const { labels, indicators } = decorations

  return Boolean(
    indicators.length ||
      labels.left ||
      labels.right ||
      labels.top ||
      labels.bottom
  )
}
