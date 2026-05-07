import { buildAccountingExportLines } from './accounting-export-line-service'
import type {
  AccountingReadinessSummary,
  AccountingValidationResult,
} from '../types/accounting'

function resultFor(
  exportType: 'ap' | 'ar',
  missingFields: AccountingValidationResult['missingFields'],
  warnings: AccountingValidationResult['warnings']
): AccountingValidationResult {
  return {
    exportType,
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  }
}

export async function validateApReadiness(laborLogId: string): Promise<AccountingValidationResult> {
  const result = await buildAccountingExportLines(laborLogId)
  return resultFor('ap', result.apIssues, result.apWarnings)
}

export async function validateArReadiness(laborLogId: string): Promise<AccountingValidationResult> {
  const result = await buildAccountingExportLines(laborLogId)
  return resultFor('ar', result.arIssues, result.arWarnings)
}

export async function validateIntacctReadiness(laborLogId: string): Promise<AccountingReadinessSummary> {
  return getAccountingReadinessSummary(laborLogId)
}

export async function getAccountingReadinessSummary(laborLogId: string): Promise<AccountingReadinessSummary> {
  const result = await buildAccountingExportLines(laborLogId)
  const ap = resultFor('ap', result.apIssues, result.apWarnings)
  const ar = resultFor('ar', result.arIssues, result.arWarnings)
  return {
    laborLogId,
    isOfficeEvent: result.isOfficeEvent,
    ap,
    ar,
    isReady: ap.isValid && ar.isValid,
  }
}
