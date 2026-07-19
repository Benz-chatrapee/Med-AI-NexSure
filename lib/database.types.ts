export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          action_type: Database["public"]["Enums"]["audit_action_type"]
          actor_auth_user_id: string | null
          actor_profile_id: string | null
          actor_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          clinic_id: string | null
          correlation_id: string | null
          created_at: string
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json
          new_value: Json | null
          occurred_at: string
          old_value: Json | null
          organization_id: string | null
          outcome: string
          reason: string | null
          resource_id: string | null
          resource_type: string
          target_record_id: string | null
          target_table: string
          user_agent: string | null
        }
        Insert: {
          action: string
          action_type: Database["public"]["Enums"]["audit_action_type"]
          actor_auth_user_id?: string | null
          actor_profile_id?: string | null
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          clinic_id?: string | null
          correlation_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          new_value?: Json | null
          occurred_at?: string
          old_value?: Json | null
          organization_id?: string | null
          outcome?: string
          reason?: string | null
          resource_id?: string | null
          resource_type: string
          target_record_id?: string | null
          target_table: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          action_type?: Database["public"]["Enums"]["audit_action_type"]
          actor_auth_user_id?: string | null
          actor_profile_id?: string | null
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          clinic_id?: string | null
          correlation_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          new_value?: Json | null
          occurred_at?: string
          old_value?: Json | null
          organization_id?: string | null
          outcome?: string
          reason?: string | null
          resource_id?: string | null
          resource_type?: string
          target_record_id?: string | null
          target_table?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_readiness_assessments: {
        Row: {
          assessment_version: number
          calculated_at: string
          calculated_by_type: string
          calculated_by_user_id: string | null
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          is_current: boolean
          organization_id: string
          readiness_status: string
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          rule_set_version: string
          total_score: number
          updated_at: string
          updated_by: string | null
          visit_id: string
        }
        Insert: {
          assessment_version?: number
          calculated_at?: string
          calculated_by_type?: string
          calculated_by_user_id?: string | null
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_current?: boolean
          organization_id: string
          readiness_status: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_set_version?: string
          total_score: number
          updated_at?: string
          updated_by?: string | null
          visit_id: string
        }
        Update: {
          assessment_version?: number
          calculated_at?: string
          calculated_by_type?: string
          calculated_by_user_id?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_current?: boolean
          organization_id?: string
          readiness_status?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_set_version?: string
          total_score?: number
          updated_at?: string
          updated_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_readiness_assessments_calculated_by_user_id_fkey"
            columns: ["calculated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_readiness_assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_readiness_assessments_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_readiness_assessments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_readiness_assessments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_readiness_assessments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_claim_readiness_assessments_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      claim_readiness_items: {
        Row: {
          assessment_id: string
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          dimension_code: string
          evidence_reference: string | null
          id: string
          is_active: boolean
          item_status: string
          organization_id: string
          raw_score: number
          reason_code: string
          reason_text: string
          updated_at: string
          updated_by: string | null
          weight: number
          weighted_score: number
        }
        Insert: {
          assessment_id: string
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dimension_code: string
          evidence_reference?: string | null
          id?: string
          is_active?: boolean
          item_status?: string
          organization_id: string
          raw_score: number
          reason_code: string
          reason_text: string
          updated_at?: string
          updated_by?: string | null
          weight: number
          weighted_score: number
        }
        Update: {
          assessment_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dimension_code?: string
          evidence_reference?: string | null
          id?: string
          is_active?: boolean
          item_status?: string
          organization_id?: string
          raw_score?: number
          reason_code?: string
          reason_text?: string
          updated_at?: string
          updated_by?: string | null
          weight?: number
          weighted_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_readiness_items_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "claim_readiness_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_readiness_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_readiness_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_readiness_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_claim_readiness_items_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      clinic_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string
          city: string | null
          clinic_id: string
          country_code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          postal_code: string | null
          province: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string
          city?: string | null
          clinic_id: string
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string
          city?: string | null
          clinic_id?: string
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_addresses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_addresses_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_addresses_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinic_addresses_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      clinic_business_hours: {
        Row: {
          clinic_id: string
          closes_at: string | null
          created_at: string
          created_by: string | null
          day_of_week: number
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          is_closed: boolean
          opens_at: string | null
          organization_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          day_of_week: number
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_closed?: boolean
          opens_at?: string | null
          organization_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          day_of_week?: number
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_closed?: boolean
          opens_at?: string | null
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_business_hours_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_business_hours_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_business_hours_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinic_business_hours_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      clinic_memberships: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          joined_at: string
          membership_status: string
          organization_id: string
          updated_at: string
          updated_by: string | null
          user_profile_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          membership_status?: string
          organization_id: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          membership_status?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_memberships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_memberships_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_memberships_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_memberships_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinic_memberships_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "fk_clinic_memberships_user_profile_tenant"
            columns: ["organization_id", "user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      clinic_settings: {
        Row: {
          appointment_buffer_minutes: number
          clinic_id: string
          created_at: string
          created_by: string | null
          default_visit_duration_minutes: number
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          settings_payload: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          appointment_buffer_minutes?: number
          clinic_id: string
          created_at?: string
          created_by?: string | null
          default_visit_duration_minutes?: number
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          settings_payload?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          appointment_buffer_minutes?: number
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          default_visit_duration_minutes?: number
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          settings_payload?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_settings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinic_settings_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      clinics: {
        Row: {
          address_line: string | null
          clinic_type: string
          code: string
          country_code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          lifecycle_status: string
          name: string
          organization_id: string
          phone: string | null
          province: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_line?: string | null
          clinic_type?: string
          code: string
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          lifecycle_status?: string
          name: string
          organization_id: string
          phone?: string | null
          province?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_line?: string | null
          clinic_type?: string
          code?: string
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          lifecycle_status?: string
          name?: string
          organization_id?: string
          phone?: string | null
          province?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinics_deleted_by_fk"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinics_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          code_system: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          diagnosis_code: string
          display_name: string
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean
          organization_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code_system?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          diagnosis_code: string
          display_name: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code_system?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          diagnosis_code?: string
          display_name?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_packages: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          checksum: string | null
          clinic_id: string
          completeness_score: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          package_status: string
          package_version: number
          storage_reference: string | null
          updated_at: string
          updated_by: string | null
          visit_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          checksum?: string | null
          clinic_id: string
          completeness_score?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          package_status?: string
          package_version?: number
          storage_reference?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          checksum?: string | null
          clinic_id?: string
          completeness_score?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          package_status?: string
          package_version?: number
          storage_reference?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_packages_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_packages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_packages_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_packages_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_packages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_packages_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_evidence_packages_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      integration_providers: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          provider_key: string
          provider_type: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          provider_key: string
          provider_type: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          provider_key?: string
          provider_type?: string
        }
        Relationships: []
      }
      inventory_batches: {
        Row: {
          batch_number: string
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          expiry_date: string | null
          id: string
          inventory_item_id: string
          is_active: boolean
          organization_id: string
          quantity_on_hand: number
          unit_cost: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          batch_number: string
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expiry_date?: string | null
          id?: string
          inventory_item_id: string
          is_active?: boolean
          organization_id: string
          quantity_on_hand?: number
          unit_cost?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          batch_number?: string
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expiry_date?: string | null
          id?: string
          inventory_item_id?: string
          is_active?: boolean
          organization_id?: string
          quantity_on_hand?: number
          unit_cost?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batches_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          generic_name: string | null
          id: string
          is_active: boolean
          item_name: string
          organization_id: string
          reorder_level: number
          sku: string
          unit: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean
          item_name: string
          organization_id: string
          reorder_level?: number
          sku: string
          unit: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean
          item_name?: string
          organization_id?: string
          reorder_level?: number
          sku?: string
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_event_types: {
        Row: {
          created_at: string
          display_name: string
          event_key: string
          id: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          display_name: string
          event_key: string
          id?: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string
          event_key?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      organization_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string
          city: string | null
          country_code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          postal_code: string | null
          province: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string
          city?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string
          city?: string | null
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_addresses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_addresses_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_addresses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_addresses_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_branding: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          logo_storage_path: string | null
          organization_id: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          logo_storage_path?: string | null
          organization_id: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          logo_storage_path?: string | null
          organization_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_branding_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_branding_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_branding_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_claim_settings: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          diagnosis_icd_weight: number
          economic_weight: number
          evidence_weight: number
          id: string
          is_active: boolean
          needs_review_threshold: number
          organization_id: string
          payer_rule_weight: number
          prescription_procedure_weight: number
          ready_threshold: number
          scoring_model_version: string
          soap_weight: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          diagnosis_icd_weight?: number
          economic_weight?: number
          evidence_weight?: number
          id?: string
          is_active?: boolean
          needs_review_threshold?: number
          organization_id: string
          payer_rule_weight?: number
          prescription_procedure_weight?: number
          ready_threshold?: number
          scoring_model_version?: string
          soap_weight?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          diagnosis_icd_weight?: number
          economic_weight?: number
          evidence_weight?: number
          id?: string
          is_active?: boolean
          needs_review_threshold?: number
          organization_id?: string
          payer_rule_weight?: number
          prescription_procedure_weight?: number
          ready_threshold?: number
          scoring_model_version?: string
          soap_weight?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_claim_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_claim_settings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_claim_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_claim_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_clinical_settings: {
        Row: {
          allow_ai_diagnosis_suggestions: boolean
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          require_ai_human_acceptance: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allow_ai_diagnosis_suggestions?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          require_ai_human_acceptance?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allow_ai_diagnosis_suggestions?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          require_ai_human_acceptance?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_clinical_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_clinical_settings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_clinical_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_clinical_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_compliance_settings: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          pdpa_region: string
          retention_policy_reference: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          pdpa_region?: string
          retention_policy_reference?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          pdpa_region?: string
          retention_policy_reference?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_compliance_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_compliance_settings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_compliance_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_compliance_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_integrations: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          integration_status: string
          is_active: boolean
          organization_id: string
          provider_id: string
          secret_reference: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          integration_status?: string
          is_active?: boolean
          organization_id: string
          provider_id: string
          secret_reference?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          integration_status?: string
          is_active?: boolean
          organization_id?: string
          provider_id?: string
          secret_reference?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_integrations_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_integrations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_integrations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          joined_at: string
          membership_status: string
          organization_id: string
          updated_at: string
          updated_by: string | null
          user_profile_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          membership_status?: string
          organization_id: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          membership_status?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_memberships_user_profile_tenant"
            columns: ["organization_id", "user_profile_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "organization_memberships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_module_settings: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          is_enabled: boolean
          module_id: string
          organization_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_enabled?: boolean
          module_id: string
          organization_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_enabled?: boolean
          module_id?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_module_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_module_settings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_module_settings_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_module_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_module_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_notification_settings: {
        Row: {
          channel: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          event_type_id: string
          id: string
          is_active: boolean
          is_enabled: boolean
          organization_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_type_id: string
          id?: string
          is_active?: boolean
          is_enabled?: boolean
          organization_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_type_id?: string
          id?: string
          is_active?: boolean
          is_enabled?: boolean
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_notification_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_notification_settings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_notification_settings_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "notification_event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_notification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_notification_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_operational_settings: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          patient_number_prefix: string
          settings_payload: Json
          updated_at: string
          updated_by: string | null
          visit_number_prefix: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          patient_number_prefix?: string
          settings_payload?: Json
          updated_at?: string
          updated_by?: string | null
          visit_number_prefix?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          patient_number_prefix?: string
          settings_payload?: Json
          updated_at?: string
          updated_by?: string | null
          visit_number_prefix?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_operational_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_operational_settings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_operational_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_operational_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_name: string
          id: string
          is_active: boolean
          metadata: Json
          organization_id: string
          support_email: string | null
          support_phone: string | null
          tax_identifier_reference: string | null
          updated_at: string
          updated_by: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          metadata?: Json
          organization_id: string
          support_email?: string | null
          support_phone?: string | null
          tax_identifier_reference?: string | null
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          organization_id?: string
          support_email?: string | null
          support_phone?: string | null
          tax_identifier_reference?: string | null
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_profiles_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_profiles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_security_settings: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          mfa_required: boolean
          organization_id: string
          session_timeout_minutes: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          mfa_required?: boolean
          organization_id: string
          session_timeout_minutes?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          mfa_required?: boolean
          organization_id?: string
          session_timeout_minutes?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_security_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_security_settings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_security_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_security_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_setting_versions: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          id: string
          new_value: Json
          organization_id: string
          previous_value: Json | null
          setting_record_id: string
          setting_table: string
          version_no: number
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_value: Json
          organization_id: string
          previous_value?: Json | null
          setting_record_id: string
          setting_table: string
          version_no: number
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_value?: Json
          organization_id?: string
          previous_value?: Json | null
          setting_record_id?: string
          setting_table?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_setting_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_setting_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          code: string
          country_code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          legal_name: string | null
          lifecycle_status: string
          locale: string
          name: string
          organization_type: string
          registration_number: string | null
          timezone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          legal_name?: string | null
          lifecycle_status?: string
          locale?: string
          name: string
          organization_type?: string
          registration_number?: string | null
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          country_code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          legal_name?: string | null
          lifecycle_status?: string
          locale?: string
          name?: string
          organization_type?: string
          registration_number?: string | null
          timezone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      patient_clinic_registrations: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          patient_id: string
          registered_at: string
          registration_number: string
          registration_status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          patient_id: string
          registered_at?: string
          registration_number: string
          registration_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          patient_id?: string
          registered_at?: string
          registration_number?: string
          registration_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patient_clinic_registrations_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "patient_clinic_registrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_clinic_registrations_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_clinic_registrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_clinic_registrations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          clinic_id: string
          consent_status: string
          consent_updated_at: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_label: string
          id: string
          is_active: boolean
          organization_id: string
          patient_code: string
          sex_at_birth: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          consent_status?: string
          consent_updated_at?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_label: string
          id?: string
          is_active?: boolean
          organization_id: string
          patient_code: string
          sex_at_birth?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          consent_status?: string
          consent_updated_at?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_label?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          patient_code?: string
          sex_at_birth?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          domain: string
          id: string
          is_active: boolean
          permission_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean
          permission_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean
          permission_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_items: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          dispensed_quantity: number
          dosage_text: string
          duration_text: string | null
          frequency_text: string
          id: string
          inventory_item_id: string | null
          is_active: boolean
          medication_label: string
          organization_id: string
          prescription_id: string
          quantity: number | null
          safety_note: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dispensed_quantity?: number
          dosage_text: string
          duration_text?: string | null
          frequency_text: string
          id?: string
          inventory_item_id?: string | null
          is_active?: boolean
          medication_label: string
          organization_id: string
          prescription_id: string
          quantity?: number | null
          safety_note?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dispensed_quantity?: number
          dosage_text?: string
          duration_text?: string | null
          frequency_text?: string
          id?: string
          inventory_item_id?: string | null
          is_active?: boolean
          medication_label?: string
          organization_id?: string
          prescription_id?: string
          quantity?: number | null
          safety_note?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          prescribing_user_id: string | null
          safety_review_required: boolean
          safety_review_summary: string | null
          status: Database["public"]["Enums"]["prescription_status"]
          updated_at: string
          updated_by: string | null
          visit_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          prescribing_user_id?: string | null
          safety_review_required?: boolean
          safety_review_summary?: string | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
          updated_by?: string | null
          visit_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          prescribing_user_id?: string | null
          safety_review_required?: boolean
          safety_review_summary?: string | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
          updated_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_prescribing_user_id_fkey"
            columns: ["prescribing_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          permission_id: string
          role_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          permission_id: string
          role_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          permission_id?: string
          role_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_system_role: boolean
          name: string
          organization_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_system_role?: boolean
          name: string
          organization_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_system_role?: boolean
          name?: string
          organization_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      soap_note_versions: {
        Row: {
          assessment: string | null
          change_reason: string
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          objective: string | null
          organization_id: string
          plan: string | null
          soap_note_id: string
          status: Database["public"]["Enums"]["soap_status"]
          subjective: string | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          assessment?: string | null
          change_reason: string
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          objective?: string | null
          organization_id: string
          plan?: string | null
          soap_note_id: string
          status: Database["public"]["Enums"]["soap_status"]
          subjective?: string | null
          updated_at?: string
          updated_by?: string | null
          version: number
        }
        Update: {
          assessment?: string | null
          change_reason?: string
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          objective?: string | null
          organization_id?: string
          plan?: string | null
          soap_note_id?: string
          status?: Database["public"]["Enums"]["soap_status"]
          subjective?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "soap_note_versions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_note_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_note_versions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_note_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_note_versions_soap_note_id_fkey"
            columns: ["soap_note_id"]
            isOneToOne: false
            referencedRelation: "soap_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_note_versions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      soap_notes: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          assessment: string | null
          clinic_id: string
          completeness_score: number | null
          confidence: number | null
          created_at: string
          created_by: string | null
          current_version: number
          deleted_at: string | null
          deleted_by: string | null
          edited_after_generation: boolean
          id: string
          is_active: boolean
          model_name: string | null
          model_version: string | null
          objective: string | null
          organization_id: string
          plan: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_type: string
          status: Database["public"]["Enums"]["soap_status"]
          subjective: string | null
          updated_at: string
          updated_by: string | null
          visit_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          assessment?: string | null
          clinic_id: string
          completeness_score?: number | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          deleted_at?: string | null
          deleted_by?: string | null
          edited_after_generation?: boolean
          id?: string
          is_active?: boolean
          model_name?: string | null
          model_version?: string | null
          objective?: string | null
          organization_id: string
          plan?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_type?: string
          status?: Database["public"]["Enums"]["soap_status"]
          subjective?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          assessment?: string | null
          clinic_id?: string
          completeness_score?: number | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          deleted_at?: string | null
          deleted_by?: string | null
          edited_after_generation?: boolean
          id?: string
          is_active?: boolean
          model_name?: string | null
          model_version?: string | null
          objective?: string | null
          organization_id?: string
          plan?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_type?: string
          status?: Database["public"]["Enums"]["soap_status"]
          subjective?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "soap_notes_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          inventory_batch_id: string | null
          inventory_item_id: string
          is_active: boolean
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          organization_id: string
          quantity: number
          reason: string
          reference_record_id: string | null
          reference_table: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          inventory_batch_id?: string | null
          inventory_item_id: string
          is_active?: boolean
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          organization_id: string
          quantity: number
          reason: string
          reference_record_id?: string | null
          reference_table?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          inventory_batch_id?: string | null
          inventory_item_id?: string
          is_active?: boolean
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          organization_id?: string
          quantity?: number
          reason?: string
          reference_record_id?: string | null
          reference_table?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_inventory_batch_id_fkey"
            columns: ["inventory_batch_id"]
            isOneToOne: false
            referencedRelation: "inventory_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_modules: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          module_key: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          module_key: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          module_key?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          department: string | null
          display_name: string
          email: string
          id: string
          is_active: boolean
          job_title: string | null
          organization_id: string
          primary_clinic_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          display_name: string
          email: string
          id: string
          is_active?: boolean
          job_title?: string | null
          organization_id: string
          primary_clinic_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          display_name?: string
          email?: string
          id?: string
          is_active?: boolean
          job_title?: string | null
          organization_id?: string
          primary_clinic_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profiles_primary_clinic_tenant"
            columns: ["organization_id", "primary_clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_primary_clinic_id_fkey"
            columns: ["primary_clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_reason: string | null
          assignment_status: string
          clinic_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          organization_id: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          role_id: string
          updated_at: string
          updated_by: string | null
          user_profile_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_reason?: string | null
          assignment_status?: string
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          role_id: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_reason?: string | null
          assignment_status?: string
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          role_id?: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_role_assignments_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "fk_user_role_assignments_user_profile_tenant"
            columns: ["organization_id", "user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "user_role_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          clinic_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          organization_id: string
          role_id: string
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          role_id: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          role_id?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "fk_user_roles_user_profile_tenant"
            columns: ["organization_id", "user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_diagnoses: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          clinic_id: string
          coding_status: string
          confidence: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          diagnosis_code: string
          diagnosis_id: string | null
          diagnosis_text: string
          diagnosis_type: string
          edited_after_generation: boolean
          id: string
          is_active: boolean
          model_name: string | null
          model_version: string | null
          organization_id: string
          source_type: string
          updated_at: string
          updated_by: string | null
          visit_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          clinic_id: string
          coding_status?: string
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          diagnosis_code: string
          diagnosis_id?: string | null
          diagnosis_text: string
          diagnosis_type?: string
          edited_after_generation?: boolean
          id?: string
          is_active?: boolean
          model_name?: string | null
          model_version?: string | null
          organization_id: string
          source_type?: string
          updated_at?: string
          updated_by?: string | null
          visit_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          clinic_id?: string
          coding_status?: string
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          diagnosis_code?: string
          diagnosis_id?: string | null
          diagnosis_text?: string
          diagnosis_type?: string
          edited_after_generation?: boolean
          id?: string
          is_active?: boolean
          model_name?: string | null
          model_version?: string | null
          organization_id?: string
          source_type?: string
          updated_at?: string
          updated_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_visit_diagnoses_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "visit_diagnoses_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_diagnoses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_diagnoses_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_diagnoses_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "diagnoses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_diagnoses_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_diagnoses_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_vitals: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          diastolic_bp: number | null
          heart_rate_bpm: number | null
          height_cm: number | null
          id: string
          is_active: boolean
          measured_at: string
          organization_id: string
          oxygen_saturation_percent: number | null
          respiratory_rate_bpm: number | null
          systolic_bp: number | null
          temperature_c: number | null
          updated_at: string
          updated_by: string | null
          visit_id: string
          weight_kg: number | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          diastolic_bp?: number | null
          heart_rate_bpm?: number | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          measured_at?: string
          organization_id: string
          oxygen_saturation_percent?: number | null
          respiratory_rate_bpm?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
          updated_at?: string
          updated_by?: string | null
          visit_id: string
          weight_kg?: number | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          diastolic_bp?: number | null
          heart_rate_bpm?: number | null
          height_cm?: number | null
          id?: string
          is_active?: boolean
          measured_at?: string
          organization_id?: string
          oxygen_saturation_percent?: number | null
          respiratory_rate_bpm?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
          updated_at?: string
          updated_by?: string | null
          visit_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_visit_vitals_clinic_tenant"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "visit_vitals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_vitals_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_vitals_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_vitals_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          attending_user_id: string | null
          claim_status: Database["public"]["Enums"]["claim_status"]
          clinic_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          department: string
          id: string
          is_active: boolean
          organization_id: string
          patient_id: string
          payer_name: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          started_at: string | null
          updated_at: string
          updated_by: string | null
          visit_number: string
          visit_status: Database["public"]["Enums"]["visit_status"]
        }
        Insert: {
          attending_user_id?: string | null
          claim_status?: Database["public"]["Enums"]["claim_status"]
          clinic_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department: string
          id?: string
          is_active?: boolean
          organization_id: string
          patient_id: string
          payer_name?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          started_at?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_number: string
          visit_status?: Database["public"]["Enums"]["visit_status"]
        }
        Update: {
          attending_user_id?: string | null
          claim_status?: Database["public"]["Enums"]["claim_status"]
          clinic_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          patient_id?: string
          payer_name?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          started_at?: string | null
          updated_at?: string
          updated_by?: string | null
          visit_number?: string
          visit_status?: Database["public"]["Enums"]["visit_status"]
        }
        Relationships: [
          {
            foreignKeyName: "visits_attending_user_id_fkey"
            columns: ["attending_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      append_core_audit_event: {
        Args: {
          p_action: string
          p_actor_profile_id: string
          p_after_state?: Json
          p_before_state?: Json
          p_clinic_id: string
          p_correlation_id?: string
          p_event_type: string
          p_metadata?: Json
          p_organization_id: string
          p_outcome: string
          p_reason: string
          p_resource_id: string
          p_resource_type: string
        }
        Returns: string
      }
      assign_role: {
        Args: {
          p_clinic_id: string
          p_effective_at?: string
          p_expires_at?: string
          p_organization_id: string
          p_reason?: string
          p_role_id: string
          p_target_profile_id: string
        }
        Returns: string
      }
      assign_role_without_audit: {
        Args: {
          p_clinic_id: string
          p_effective_at?: string
          p_expires_at?: string
          p_organization_id: string
          p_reason?: string
          p_role_id: string
          p_target_profile_id: string
        }
        Returns: string
      }
      audit_json_contains_prohibited_data: {
        Args: { p_payload: Json }
        Returns: boolean
      }
      current_user_clinic_ids: { Args: never; Returns: string[] }
      current_user_has_permission: {
        Args: { permission_key: string }
        Returns: boolean
      }
      current_user_has_role: { Args: { role_name: string }; Returns: boolean }
      current_user_organization_id: { Args: never; Returns: string }
      current_user_profile: {
        Args: never
        Returns: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          department: string | null
          display_name: string
          email: string
          id: string
          is_active: boolean
          job_title: string | null
          organization_id: string
          primary_clinic_id: string | null
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "user_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_profile_id: { Args: never; Returns: string }
      has_clinic_access: {
        Args: { p_clinic_id: string; p_organization_id: string }
        Returns: boolean
      }
      has_lifecycle_permission: {
        Args: {
          p_clinic_id?: string
          p_organization_id: string
          p_permission_key: string
          p_platform_required?: boolean
        }
        Returns: boolean
      }
      has_permission: {
        Args: {
          p_clinic_id?: string
          p_organization_id: string
          p_permission_key: string
        }
        Returns: boolean
      }
      has_role_assignment_permission: {
        Args: {
          p_clinic_id?: string
          p_organization_id: string
          p_permission_key: string
          p_platform_required?: boolean
        }
        Returns: boolean
      }
      is_lifecycle_transition_allowed: {
        Args: { p_current_status: string; p_target_status: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      lifecycle_permission_for_status: {
        Args: { p_subject: string; p_target_status: string }
        Returns: string
      }
      revoke_role_assignment: {
        Args: { p_assignment_id: string; p_reason: string }
        Returns: string
      }
      revoke_role_assignment_without_audit: {
        Args: { p_assignment_id: string; p_reason: string }
        Returns: string
      }
      role_assignment_role_scope: {
        Args: { p_role_name: string }
        Returns: string
      }
      transition_clinic_lifecycle: {
        Args: { p_clinic_id: string; p_reason: string; p_target_status: string }
        Returns: string
      }
      transition_clinic_lifecycle_without_audit: {
        Args: { p_clinic_id: string; p_reason: string; p_target_status: string }
        Returns: string
      }
      transition_organization_lifecycle: {
        Args: {
          p_organization_id: string
          p_reason: string
          p_target_status: string
        }
        Returns: string
      }
      transition_organization_lifecycle_without_audit: {
        Args: {
          p_organization_id: string
          p_reason: string
          p_target_status: string
        }
        Returns: string
      }
    }
    Enums: {
      audit_action_type:
        | "create"
        | "read"
        | "update"
        | "delete"
        | "view"
        | "export"
        | "login"
        | "permission_change"
        | "clinical_review"
        | "claim_review"
        | "evidence_change"
        | "dashboard_viewed"
        | "filters_applied"
      claim_status:
        | "not_started"
        | "documentation_pending"
        | "ready_for_review"
        | "needs_review"
        | "blocked"
        | "submitted"
      prescription_status:
        | "draft"
        | "pending_review"
        | "approved_by_clinician"
        | "dispensed"
        | "cancelled"
      risk_level: "low" | "medium" | "high" | "critical"
      soap_status: "draft" | "submitted" | "reviewed" | "amended" | "archived"
      stock_movement_type:
        | "stock_in"
        | "stock_out"
        | "adjustment"
        | "return"
        | "waste"
        | "transfer"
      visit_status:
        | "scheduled"
        | "checked_in"
        | "in_consultation"
        | "completed"
        | "cancelled"
        | "no_show"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      audit_action_type: [
        "create",
        "read",
        "update",
        "delete",
        "view",
        "export",
        "login",
        "permission_change",
        "clinical_review",
        "claim_review",
        "evidence_change",
        "dashboard_viewed",
        "filters_applied",
      ],
      claim_status: [
        "not_started",
        "documentation_pending",
        "ready_for_review",
        "needs_review",
        "blocked",
        "submitted",
      ],
      prescription_status: [
        "draft",
        "pending_review",
        "approved_by_clinician",
        "dispensed",
        "cancelled",
      ],
      risk_level: ["low", "medium", "high", "critical"],
      soap_status: ["draft", "submitted", "reviewed", "amended", "archived"],
      stock_movement_type: [
        "stock_in",
        "stock_out",
        "adjustment",
        "return",
        "waste",
        "transfer",
      ],
      visit_status: [
        "scheduled",
        "checked_in",
        "in_consultation",
        "completed",
        "cancelled",
        "no_show",
      ],
    },
  },
} as const

