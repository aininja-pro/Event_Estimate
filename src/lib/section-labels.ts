export type EstimateSectionKey =
  | 'production'
  | 'travel'
  | 'creative'
  | 'access'
  | 'misc'
  | 'fees'

export const ESTIMATE_SECTION_LABELS: Record<EstimateSectionKey, string> = {
  production: 'Production',
  travel: 'Travel',
  creative: 'Creative',
  access: 'Logistics',
  misc: 'Miscellaneous',
  fees: 'Fees & Markups',
}

export function estimateSectionLabel(section: string | null | undefined): string {
  if (section && section in ESTIMATE_SECTION_LABELS) {
    return ESTIMATE_SECTION_LABELS[section as EstimateSectionKey]
  }
  return section || 'Miscellaneous'
}
