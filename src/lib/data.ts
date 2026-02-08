import type {
  ExecutiveSummary,
  CostAnalysis,
  VarianceData,
  ManagerData,
} from '@/types/dashboard'
import type { RateCardRole } from '@/types/rate-card'
import type { AIContext } from '@/types/ai-context'

import executiveData from '@/data/dashboard-executive.json'
import costsData from '@/data/dashboard-costs.json'
import varianceData from '@/data/dashboard-variance.json'
import managersData from '@/data/dashboard-managers.json'
import rateCardData from '@/data/rate-card.json'
import aiContextData from '@/data/ai-context.json'

export function getExecutiveSummary(): ExecutiveSummary {
  return executiveData as ExecutiveSummary
}

export function getCostAnalysis(): CostAnalysis {
  return costsData as CostAnalysis
}

export function getVarianceData(): VarianceData {
  return varianceData as VarianceData
}

export function getManagerData(): ManagerData {
  return managersData as ManagerData
}

export function getRateCard(): RateCardRole[] {
  return rateCardData as RateCardRole[]
}

export function getAIContext(): AIContext {
  return aiContextData as AIContext
}
