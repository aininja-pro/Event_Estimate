export type Permission =
  | 'create_estimate'
  | 'edit_estimate'
  | 'submit_for_review'
  | 'approve_standard'
  | 'approve_threshold'
  | 'edit_rate_cards'
  | 'edit_recap'
  | 'mark_invoiced'
  | 'submit_recap_for_accounting'
  | 'review_recap'
  | 'approve_recap'
  | 'request_recap_corrections'
  | 'mark_export_ready_invoiced'
  | 'export_intacct_csv'
  | 'edit_accounting_mappings'
  | 'delete_estimate'
  | 'transition_segment'

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'create_estimate', 'edit_estimate', 'submit_for_review',
    'approve_standard', 'approve_threshold',
    'edit_rate_cards', 'edit_recap', 'mark_invoiced',
    'submit_recap_for_accounting', 'review_recap', 'approve_recap',
    'request_recap_corrections', 'mark_export_ready_invoiced',
    'export_intacct_csv', 'edit_accounting_mappings',
    'delete_estimate', 'transition_segment',
  ],
  cfo: [
    'create_estimate', 'edit_estimate', 'submit_for_review',
    'approve_standard', 'approve_threshold',
    'edit_recap', 'mark_invoiced', 'review_recap', 'approve_recap',
    'request_recap_corrections', 'mark_export_ready_invoiced', 'export_intacct_csv',
    'edit_accounting_mappings', 'transition_segment',
  ],
  accounting: [
    'edit_recap', 'mark_invoiced', 'review_recap', 'approve_recap',
    'request_recap_corrections', 'mark_export_ready_invoiced',
    'export_intacct_csv', 'edit_accounting_mappings', 'transition_segment',
  ],
  account_manager: [
    'create_estimate', 'edit_estimate', 'submit_for_review',
    'approve_standard',
    'edit_recap', 'submit_recap_for_accounting', 'transition_segment', 'delete_estimate',
  ],
  operations: [
    'create_estimate', 'edit_estimate', 'submit_for_review',
    'edit_recap', 'submit_recap_for_accounting', 'transition_segment',
  ],
  production_manager: [
    'create_estimate', 'edit_estimate', 'submit_for_review',
    'edit_recap', 'submit_recap_for_accounting', 'transition_segment',
  ],
}

export function hasPermission(dbRole: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[dbRole]?.includes(permission) ?? false
}
