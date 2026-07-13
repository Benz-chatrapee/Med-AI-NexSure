-- Med AI NexSure MVP 1 indexes
-- Indexes focus on tenant-scoped queries, joins, statuses, dates, and audit lookup.

create index if not exists idx_clinics_organization_id on clinics (organization_id);
create index if not exists idx_clinics_active_scope on clinics (organization_id, is_active) where deleted_at is null;

create index if not exists idx_user_profiles_organization_id on user_profiles (organization_id);
create index if not exists idx_user_profiles_primary_clinic_id on user_profiles (primary_clinic_id);
create index if not exists idx_user_profiles_email on user_profiles (email);

create index if not exists idx_roles_organization_id on roles (organization_id);
create index if not exists idx_permissions_permission_key on permissions (permission_key);
create index if not exists idx_user_roles_organization_id on user_roles (organization_id);
create index if not exists idx_user_roles_clinic_id on user_roles (clinic_id);
create index if not exists idx_user_roles_user_id on user_roles (user_id);
create index if not exists idx_user_roles_role_id on user_roles (role_id);
create index if not exists idx_role_permissions_role_id on role_permissions (role_id);
create index if not exists idx_role_permissions_permission_id on role_permissions (permission_id);

create index if not exists idx_patients_organization_id on patients (organization_id);
create index if not exists idx_patients_clinic_id on patients (clinic_id);
create index if not exists idx_patients_created_at on patients (created_at);
create index if not exists idx_patients_scope_active on patients (organization_id, clinic_id, is_active) where deleted_at is null;

create index if not exists idx_visits_organization_id on visits (organization_id);
create index if not exists idx_visits_clinic_id on visits (clinic_id);
create index if not exists idx_visits_patient_id on visits (patient_id);
create index if not exists idx_visits_attending_user_id on visits (attending_user_id);
create index if not exists idx_visits_created_at on visits (created_at);
create index if not exists idx_visits_visit_status on visits (visit_status);
create index if not exists idx_visits_claim_status on visits (claim_status);
create index if not exists idx_visits_risk_level on visits (risk_level);
create index if not exists idx_visits_dashboard_scope on visits (organization_id, clinic_id, visit_status, claim_status, risk_level, created_at);

create index if not exists idx_soap_notes_organization_id on soap_notes (organization_id);
create index if not exists idx_soap_notes_clinic_id on soap_notes (clinic_id);
create index if not exists idx_soap_notes_visit_id on soap_notes (visit_id);
create index if not exists idx_soap_notes_status on soap_notes (status);
create index if not exists idx_soap_notes_created_at on soap_notes (created_at);

create index if not exists idx_soap_note_versions_organization_id on soap_note_versions (organization_id);
create index if not exists idx_soap_note_versions_clinic_id on soap_note_versions (clinic_id);
create index if not exists idx_soap_note_versions_soap_note_id on soap_note_versions (soap_note_id);
create index if not exists idx_soap_note_versions_created_at on soap_note_versions (created_at);

create index if not exists idx_prescriptions_organization_id on prescriptions (organization_id);
create index if not exists idx_prescriptions_clinic_id on prescriptions (clinic_id);
create index if not exists idx_prescriptions_visit_id on prescriptions (visit_id);
create index if not exists idx_prescriptions_status on prescriptions (status);
create index if not exists idx_prescriptions_created_at on prescriptions (created_at);

create index if not exists idx_prescription_items_organization_id on prescription_items (organization_id);
create index if not exists idx_prescription_items_clinic_id on prescription_items (clinic_id);
create index if not exists idx_prescription_items_prescription_id on prescription_items (prescription_id);
create index if not exists idx_prescription_items_inventory_item_id on prescription_items (inventory_item_id);

create index if not exists idx_inventory_items_organization_id on inventory_items (organization_id);
create index if not exists idx_inventory_items_clinic_id on inventory_items (clinic_id);
create index if not exists idx_inventory_items_sku on inventory_items (sku);
create index if not exists idx_inventory_items_scope_active on inventory_items (organization_id, clinic_id, is_active) where deleted_at is null;

create index if not exists idx_inventory_batches_organization_id on inventory_batches (organization_id);
create index if not exists idx_inventory_batches_clinic_id on inventory_batches (clinic_id);
create index if not exists idx_inventory_batches_inventory_item_id on inventory_batches (inventory_item_id);
create index if not exists idx_inventory_batches_expiry_date on inventory_batches (expiry_date);

create index if not exists idx_stock_movements_organization_id on stock_movements (organization_id);
create index if not exists idx_stock_movements_clinic_id on stock_movements (clinic_id);
create index if not exists idx_stock_movements_inventory_item_id on stock_movements (inventory_item_id);
create index if not exists idx_stock_movements_inventory_batch_id on stock_movements (inventory_batch_id);
create index if not exists idx_stock_movements_created_at on stock_movements (created_at);
create index if not exists idx_stock_movements_movement_type on stock_movements (movement_type);

create index if not exists idx_audit_logs_organization_id on audit_logs (organization_id);
create index if not exists idx_audit_logs_clinic_id on audit_logs (clinic_id);
create index if not exists idx_audit_logs_actor_user_id on audit_logs (actor_user_id);
create index if not exists idx_audit_logs_action_type on audit_logs (action_type);
create index if not exists idx_audit_logs_created_at on audit_logs (created_at);
create index if not exists idx_audit_logs_target on audit_logs (target_table, target_record_id);
create index if not exists idx_audit_logs_scope_time on audit_logs (organization_id, clinic_id, created_at desc);
