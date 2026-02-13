export const feedbackCategories = [
  'Estimate Lifecycle',
  'Phase 2 Roadmap',
  'Estimate Builder',
  'Rate Card Management',
  'General',
] as const

export type FeedbackCategory = (typeof feedbackCategories)[number]

export interface Feedback {
  id: string
  name: string
  category: FeedbackCategory
  message: string
  status: 'new' | 'reviewed'
  created_at: string
}
