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
      claim_ai_assessments: {
        Row: {
          assessment_number: number
          assessment_purpose: string
          assessment_status: string
          assessment_type: string
          claim_id: string
          clinic_id: string
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          created_by: string
          error_code: string | null
          error_message: string | null
          feature_set_hash: string | null
          feature_set_version: string | null
          governance_policy_version: string
          id: string
          idempotency_key: string | null
          input_completeness_score: number | null
          input_quality_status: string
          input_snapshot: Json
          metadata: Json
          model_deployment_reference: string | null
          model_hash: string | null
          model_name: string
          model_provider: string
          model_version: string
          organization_id: string
          output_summary: Json
          prompt_version: string | null
          recommended_action: string
          requires_human_review: boolean
          review_required_by: string | null
          risk_level: string
          risk_score: number | null
          ruleset_reference: string | null
          ruleset_version: string | null
          started_at: string | null
          threshold_snapshot: Json
          trigger_source: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          assessment_number: number
          assessment_purpose: string
          assessment_status?: string
          assessment_type: string
          claim_id: string
          clinic_id: string
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          created_by: string
          error_code?: string | null
          error_message?: string | null
          feature_set_hash?: string | null
          feature_set_version?: string | null
          governance_policy_version: string
          id?: string
          idempotency_key?: string | null
          input_completeness_score?: number | null
          input_quality_status?: string
          input_snapshot?: Json
          metadata?: Json
          model_deployment_reference?: string | null
          model_hash?: string | null
          model_name: string
          model_provider: string
          model_version: string
          organization_id: string
          output_summary?: Json
          prompt_version?: string | null
          recommended_action?: string
          requires_human_review?: boolean
          review_required_by?: string | null
          risk_level?: string
          risk_score?: number | null
          ruleset_reference?: string | null
          ruleset_version?: string | null
          started_at?: string | null
          threshold_snapshot?: Json
          trigger_source: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          assessment_number?: number
          assessment_purpose?: string
          assessment_status?: string
          assessment_type?: string
          claim_id?: string
          clinic_id?: string
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string
          error_code?: string | null
          error_message?: string | null
          feature_set_hash?: string | null
          feature_set_version?: string | null
          governance_policy_version?: string
          id?: string
          idempotency_key?: string | null
          input_completeness_score?: number | null
          input_quality_status?: string
          input_snapshot?: Json
          metadata?: Json
          model_deployment_reference?: string | null
          model_hash?: string | null
          model_name?: string
          model_provider?: string
          model_version?: string
          organization_id?: string
          output_summary?: Json
          prompt_version?: string | null
          recommended_action?: string
          requires_human_review?: boolean
          review_required_by?: string | null
          risk_level?: string
          risk_score?: number | null
          ruleset_reference?: string | null
          ruleset_version?: string | null
          started_at?: string | null
          threshold_snapshot?: Json
          trigger_source?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_ai_assessments_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_ai_assessments_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_ai_assessments_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_ai_explanations: {
        Row: {
          ai_assessment_id: string
          baseline_value: Json | null
          claim_id: string
          clinic_id: string
          contribution_score: number | null
          created_at: string
          created_by: string
          explanation_data: Json
          explanation_type: string
          feature_name: string | null
          feature_value: Json | null
          id: string
          organization_id: string
          risk_signal_id: string | null
          sequence_number: number
          source_reference: string | null
          source_type: string | null
          summary: string
          title: string
        }
        Insert: {
          ai_assessment_id: string
          baseline_value?: Json | null
          claim_id: string
          clinic_id: string
          contribution_score?: number | null
          created_at?: string
          created_by: string
          explanation_data?: Json
          explanation_type: string
          feature_name?: string | null
          feature_value?: Json | null
          id?: string
          organization_id: string
          risk_signal_id?: string | null
          sequence_number: number
          source_reference?: string | null
          source_type?: string | null
          summary: string
          title: string
        }
        Update: {
          ai_assessment_id?: string
          baseline_value?: Json | null
          claim_id?: string
          clinic_id?: string
          contribution_score?: number | null
          created_at?: string
          created_by?: string
          explanation_data?: Json
          explanation_type?: string
          feature_name?: string | null
          feature_value?: Json | null
          id?: string
          organization_id?: string
          risk_signal_id?: string | null
          sequence_number?: number
          source_reference?: string | null
          source_type?: string | null
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_ai_explanations_assessment_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "ai_assessment_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_ai_assessments"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_ai_explanations_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_ai_explanations_signal_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "ai_assessment_id",
              "risk_signal_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_ai_risk_signals"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "ai_assessment_id",
              "id",
            ]
          },
        ]
      }
      claim_ai_review_outcomes: {
        Row: {
          ai_assessment_id: string
          claim_id: string
          clinic_id: string
          confirmed_action: string | null
          confirmed_risk_level: string | null
          created_at: string
          created_by: string
          feedback_label: string | null
          feedback_notes: string | null
          id: string
          organization_id: string
          review_decision: string | null
          review_number: number
          review_reason_code: string | null
          review_reason_text: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_role_snapshot: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          ai_assessment_id: string
          claim_id: string
          clinic_id: string
          confirmed_action?: string | null
          confirmed_risk_level?: string | null
          created_at?: string
          created_by: string
          feedback_label?: string | null
          feedback_notes?: string | null
          id?: string
          organization_id: string
          review_decision?: string | null
          review_number: number
          review_reason_code?: string | null
          review_reason_text?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_role_snapshot?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          ai_assessment_id?: string
          claim_id?: string
          clinic_id?: string
          confirmed_action?: string | null
          confirmed_risk_level?: string | null
          created_at?: string
          created_by?: string
          feedback_label?: string | null
          feedback_notes?: string | null
          id?: string
          organization_id?: string
          review_decision?: string | null
          review_number?: number
          review_reason_code?: string | null
          review_reason_text?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_role_snapshot?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_ai_review_outcomes_assessment_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "ai_assessment_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_ai_assessments"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_ai_review_outcomes_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_ai_review_outcomes_reviewed_by_fk"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_ai_review_outcomes_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_ai_risk_signals: {
        Row: {
          ai_assessment_id: string
          claim_id: string
          clinic_id: string
          confidence_score: number | null
          created_at: string
          created_by: string
          evidence_references: Json
          feature_values: Json
          field_path: string | null
          id: string
          metadata: Json
          organization_id: string
          recommended_action: string
          requires_human_review: boolean
          risk_score: number | null
          severity: string
          signal_category: string
          signal_code: string
          signal_description: string
          signal_title: string
          subject_reference_id: string | null
          subject_type: string
        }
        Insert: {
          ai_assessment_id: string
          claim_id: string
          clinic_id: string
          confidence_score?: number | null
          created_at?: string
          created_by: string
          evidence_references?: Json
          feature_values?: Json
          field_path?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          recommended_action: string
          requires_human_review?: boolean
          risk_score?: number | null
          severity: string
          signal_category: string
          signal_code: string
          signal_description: string
          signal_title: string
          subject_reference_id?: string | null
          subject_type?: string
        }
        Update: {
          ai_assessment_id?: string
          claim_id?: string
          clinic_id?: string
          confidence_score?: number | null
          created_at?: string
          created_by?: string
          evidence_references?: Json
          feature_values?: Json
          field_path?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          recommended_action?: string
          requires_human_review?: boolean
          risk_score?: number | null
          severity?: string
          signal_category?: string
          signal_code?: string
          signal_description?: string
          signal_title?: string
          subject_reference_id?: string | null
          subject_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_ai_risk_signals_assessment_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "ai_assessment_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_ai_assessments"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_ai_risk_signals_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_benefit_limit_results: {
        Row: {
          benefit_code: string
          benefit_name_snapshot: string | null
          benefit_period: string
          blocking_action: string
          claim_amount: number
          claim_id: string
          clinic_id: string
          created_at: string
          created_by: string
          currency_code: string
          evaluated_at: string
          evaluated_by: string | null
          evaluation_source: string
          field_path: string | null
          id: string
          limit_amount: number
          organization_id: string
          policy_coverage_id: string
          reason_code: string | null
          reason_text: string | null
          remaining_amount_after_claim: number | null
          remaining_amount_before_claim: number | null
          result_data: Json
          result_status: string
          rule_code: string
          rule_definition_hash: string | null
          rule_version: string
          subject_reference_id: string | null
          subject_type: string
          used_amount_before_claim: number
        }
        Insert: {
          benefit_code: string
          benefit_name_snapshot?: string | null
          benefit_period: string
          blocking_action?: string
          claim_amount?: number
          claim_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          currency_code: string
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          field_path?: string | null
          id?: string
          limit_amount: number
          organization_id: string
          policy_coverage_id: string
          reason_code?: string | null
          reason_text?: string | null
          remaining_amount_after_claim?: number | null
          remaining_amount_before_claim?: number | null
          result_data?: Json
          result_status: string
          rule_code: string
          rule_definition_hash?: string | null
          rule_version: string
          subject_reference_id?: string | null
          subject_type?: string
          used_amount_before_claim?: number
        }
        Update: {
          benefit_code?: string
          benefit_name_snapshot?: string | null
          benefit_period?: string
          blocking_action?: string
          claim_amount?: number
          claim_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          field_path?: string | null
          id?: string
          limit_amount?: number
          organization_id?: string
          policy_coverage_id?: string
          reason_code?: string | null
          reason_text?: string | null
          remaining_amount_after_claim?: number | null
          remaining_amount_before_claim?: number | null
          result_data?: Json
          result_status?: string
          rule_code?: string
          rule_definition_hash?: string | null
          rule_version?: string
          subject_reference_id?: string | null
          subject_type?: string
          used_amount_before_claim?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_benefit_limit_results_coverage_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "policy_coverage_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_policy_coverages"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_benefit_limit_results_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_benefit_limit_results_evaluated_by_fk"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_decision_adjustments: {
        Row: {
          adjusted_amount: number
          adjustment_amount: number | null
          adjustment_number: number
          adjustment_type: string
          claim_decision_id: string
          claim_id: string
          claim_item_id: string | null
          clinic_id: string
          created_at: string
          created_by: string
          currency_code: string
          id: string
          metadata: Json
          organization_id: string
          original_amount: number
          reason_code: string
          reason_text: string
          source_reference: string | null
          source_type: string
        }
        Insert: {
          adjusted_amount: number
          adjustment_amount?: number | null
          adjustment_number: number
          adjustment_type: string
          claim_decision_id: string
          claim_id: string
          claim_item_id?: string | null
          clinic_id: string
          created_at?: string
          created_by: string
          currency_code: string
          id?: string
          metadata?: Json
          organization_id: string
          original_amount: number
          reason_code: string
          reason_text: string
          source_reference?: string | null
          source_type?: string
        }
        Update: {
          adjusted_amount?: number
          adjustment_amount?: number | null
          adjustment_number?: number
          adjustment_type?: string
          claim_decision_id?: string
          claim_id?: string
          claim_item_id?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          id?: string
          metadata?: Json
          organization_id?: string
          original_amount?: number
          reason_code?: string
          reason_text?: string
          source_reference?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_decision_adjustments_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_decision_adjustments_decision_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_decision_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_decisions"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_decision_adjustments_item_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_item_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_items"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_decision_adjustments_reason_code_fk"
            columns: ["reason_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      claim_decisions: {
        Row: {
          approved_amount: number | null
          claim_id: string
          claim_review_id: string
          clinic_id: string
          created_at: string
          created_by: string
          currency_code: string
          decided_at: string | null
          decided_by: string | null
          decision_outcome: string | null
          decision_reason_code: string | null
          decision_reason_text: string | null
          decision_role_snapshot: string | null
          decision_status: string
          decision_summary: string | null
          decision_version: number
          id: string
          metadata: Json
          organization_id: string
          patient_responsibility_amount: number | null
          payer_responsibility_amount: number | null
          rejected_amount: number | null
          submitted_amount: number
          supersedes_decision_id: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          approved_amount?: number | null
          claim_id: string
          claim_review_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          currency_code: string
          decided_at?: string | null
          decided_by?: string | null
          decision_outcome?: string | null
          decision_reason_code?: string | null
          decision_reason_text?: string | null
          decision_role_snapshot?: string | null
          decision_status?: string
          decision_summary?: string | null
          decision_version: number
          id?: string
          metadata?: Json
          organization_id: string
          patient_responsibility_amount?: number | null
          payer_responsibility_amount?: number | null
          rejected_amount?: number | null
          submitted_amount: number
          supersedes_decision_id?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          approved_amount?: number | null
          claim_id?: string
          claim_review_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_outcome?: string | null
          decision_reason_code?: string | null
          decision_reason_text?: string | null
          decision_role_snapshot?: string | null
          decision_status?: string
          decision_summary?: string | null
          decision_version?: number
          id?: string
          metadata?: Json
          organization_id?: string
          patient_responsibility_amount?: number | null
          payer_responsibility_amount?: number | null
          rejected_amount?: number | null
          submitted_amount?: number
          supersedes_decision_id?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_decisions_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_decisions_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_decisions_decided_by_fk"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_decisions_reason_code_fk"
            columns: ["decision_reason_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "claim_decisions_review_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_review_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_reviews"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_decisions_supersedes_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "supersedes_decision_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_decisions"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_decisions_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_diagnoses: {
        Row: {
          claim_id: string
          clinic_id: string
          coding_status: string
          coding_system: string
          coding_version: string
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          diagnosis_code: string
          diagnosis_description_snapshot: string | null
          diagnosis_rank: number
          diagnosis_role: string
          id: string
          metadata: Json
          organization_id: string
          present_on_admission: string | null
          source_visit_diagnosis_id: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          claim_id: string
          clinic_id: string
          coding_status?: string
          coding_system?: string
          coding_version: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          diagnosis_code: string
          diagnosis_description_snapshot?: string | null
          diagnosis_rank: number
          diagnosis_role: string
          id?: string
          metadata?: Json
          organization_id: string
          present_on_admission?: string | null
          source_visit_diagnosis_id?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          claim_id?: string
          clinic_id?: string
          coding_status?: string
          coding_system?: string
          coding_version?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          diagnosis_code?: string
          diagnosis_description_snapshot?: string | null
          diagnosis_rank?: number
          diagnosis_role?: string
          id?: string
          metadata?: Json
          organization_id?: string
          present_on_admission?: string | null
          source_visit_diagnosis_id?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_diagnoses_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_diagnoses_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_diagnoses_deleted_by_fk"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_diagnoses_source_visit_diagnosis_fk"
            columns: ["source_visit_diagnosis_id"]
            isOneToOne: false
            referencedRelation: "visit_diagnoses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_diagnoses_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_documents: {
        Row: {
          claim_id: string
          clinic_id: string
          clinical_document_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          document_role: string
          document_status: string
          document_type: string
          id: string
          is_mandatory: boolean
          metadata: Json
          organization_id: string
          received_at: string
          updated_at: string
          updated_by: string
          validated_at: string | null
          validated_by: string | null
          validation_message: string | null
        }
        Insert: {
          claim_id: string
          clinic_id: string
          clinical_document_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          document_role?: string
          document_status?: string
          document_type: string
          id?: string
          is_mandatory?: boolean
          metadata?: Json
          organization_id: string
          received_at?: string
          updated_at?: string
          updated_by: string
          validated_at?: string | null
          validated_by?: string | null
          validation_message?: string | null
        }
        Update: {
          claim_id?: string
          clinic_id?: string
          clinical_document_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          document_role?: string
          document_status?: string
          document_type?: string
          id?: string
          is_mandatory?: boolean
          metadata?: Json
          organization_id?: string
          received_at?: string
          updated_at?: string
          updated_by?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_documents_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_documents_clinical_document_fk"
            columns: ["clinical_document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_documents_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_documents_deleted_by_fk"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_documents_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_documents_validated_by_fk"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_evidence_requirements: {
        Row: {
          allow_waiver: boolean
          claim_id: string
          clinic_id: string
          condition_snapshot: Json
          created_at: string
          created_by: string
          document_type: string | null
          evidence_category: string
          id: string
          minimum_document_count: number
          organization_id: string
          requirement_code: string
          requirement_level: string
          requirement_status: string
          requirement_text: string
          source_reference: string | null
          source_type: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          allow_waiver?: boolean
          claim_id: string
          clinic_id: string
          condition_snapshot?: Json
          created_at?: string
          created_by: string
          document_type?: string | null
          evidence_category: string
          id?: string
          minimum_document_count?: number
          organization_id: string
          requirement_code: string
          requirement_level?: string
          requirement_status?: string
          requirement_text: string
          source_reference?: string | null
          source_type: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          allow_waiver?: boolean
          claim_id?: string
          clinic_id?: string
          condition_snapshot?: Json
          created_at?: string
          created_by?: string
          document_type?: string | null
          evidence_category?: string
          id?: string
          minimum_document_count?: number
          organization_id?: string
          requirement_code?: string
          requirement_level?: string
          requirement_status?: string
          requirement_text?: string
          source_reference?: string | null
          source_type?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_evidence_requirements_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_evidence_requirements_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_evidence_requirements_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_evidence_results: {
        Row: {
          accepted_document_count: number
          claim_id: string
          clinic_id: string
          created_at: string
          created_by: string
          evaluated_at: string
          evaluated_by: string | null
          evaluation_source: string
          id: string
          matched_document_count: number
          metadata: Json
          organization_id: string
          primary_claim_document_id: string | null
          requirement_id: string
          result_code: string | null
          result_message: string | null
          result_status: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          accepted_document_count?: number
          claim_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          id?: string
          matched_document_count?: number
          metadata?: Json
          organization_id: string
          primary_claim_document_id?: string | null
          requirement_id: string
          result_code?: string | null
          result_message?: string | null
          result_status?: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          accepted_document_count?: number
          claim_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          id?: string
          matched_document_count?: number
          metadata?: Json
          organization_id?: string
          primary_claim_document_id?: string | null
          requirement_id?: string
          result_code?: string | null
          result_message?: string | null
          result_status?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_evidence_results_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_evidence_results_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_evidence_results_document_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "primary_claim_document_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_documents"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_evidence_results_evaluated_by_fk"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_evidence_results_requirement_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "requirement_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_evidence_requirements"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_evidence_results_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_evidence_waivers: {
        Row: {
          approved_at: string
          approved_by: string
          claim_id: string
          clinic_id: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          metadata: Json
          organization_id: string
          reason_code: string
          reason_text: string
          requirement_id: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          updated_at: string
          updated_by: string
          waiver_status: string
        }
        Insert: {
          approved_at?: string
          approved_by: string
          claim_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          reason_code: string
          reason_text: string
          requirement_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          updated_by: string
          waiver_status?: string
        }
        Update: {
          approved_at?: string
          approved_by?: string
          claim_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          reason_code?: string
          reason_text?: string
          requirement_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          updated_by?: string
          waiver_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_evidence_waivers_approved_by_fk"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_evidence_waivers_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_evidence_waivers_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_evidence_waivers_requirement_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "requirement_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_evidence_requirements"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_evidence_waivers_revoked_by_fk"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_evidence_waivers_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_exclusion_results: {
        Row: {
          blocking_action: string
          claim_id: string
          clinic_id: string
          created_at: string
          created_by: string
          evaluated_at: string
          evaluated_by: string | null
          evaluation_source: string
          exclusion_category: string
          exclusion_code: string
          exclusion_text_snapshot: string
          field_path: string | null
          id: string
          organization_id: string
          policy_coverage_id: string
          reason_code: string | null
          reason_text: string | null
          result_data: Json
          result_status: string
          rule_code: string
          rule_definition_hash: string | null
          rule_version: string
          severity: string
          source_reference: string | null
          source_version: string | null
          subject_reference_id: string | null
          subject_type: string
        }
        Insert: {
          blocking_action?: string
          claim_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          exclusion_category: string
          exclusion_code: string
          exclusion_text_snapshot: string
          field_path?: string | null
          id?: string
          organization_id: string
          policy_coverage_id: string
          reason_code?: string | null
          reason_text?: string | null
          result_data?: Json
          result_status: string
          rule_code: string
          rule_definition_hash?: string | null
          rule_version: string
          severity: string
          source_reference?: string | null
          source_version?: string | null
          subject_reference_id?: string | null
          subject_type?: string
        }
        Update: {
          blocking_action?: string
          claim_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          exclusion_category?: string
          exclusion_code?: string
          exclusion_text_snapshot?: string
          field_path?: string | null
          id?: string
          organization_id?: string
          policy_coverage_id?: string
          reason_code?: string | null
          reason_text?: string | null
          result_data?: Json
          result_status?: string
          rule_code?: string
          rule_definition_hash?: string | null
          rule_version?: string
          severity?: string
          source_reference?: string | null
          source_version?: string | null
          subject_reference_id?: string | null
          subject_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_exclusion_results_coverage_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "policy_coverage_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_policy_coverages"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_exclusion_results_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_exclusion_results_evaluated_by_fk"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_items: {
        Row: {
          approved_amount: number | null
          claim_id: string
          claimed_amount: number
          clinic_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string
          discount_amount: number
          eligible_amount: number | null
          gross_amount: number
          id: string
          item_type: string
          line_number: number
          metadata: Json
          organization_id: string
          patient_responsibility_amount: number | null
          payer_responsibility_amount: number | null
          prescription_item_id: string | null
          quantity: number
          revenue_code: string | null
          service_code: string | null
          service_date: string
          source_procedure_reference: string | null
          status: string
          supporting_document_id: string | null
          tax_amount: number
          unit_price: number
          updated_at: string
          updated_by: string
        }
        Insert: {
          approved_amount?: number | null
          claim_id: string
          claimed_amount?: number
          clinic_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          discount_amount?: number
          eligible_amount?: number | null
          gross_amount?: number
          id?: string
          item_type: string
          line_number: number
          metadata?: Json
          organization_id: string
          patient_responsibility_amount?: number | null
          payer_responsibility_amount?: number | null
          prescription_item_id?: string | null
          quantity?: number
          revenue_code?: string | null
          service_code?: string | null
          service_date: string
          source_procedure_reference?: string | null
          status?: string
          supporting_document_id?: string | null
          tax_amount?: number
          unit_price?: number
          updated_at?: string
          updated_by: string
        }
        Update: {
          approved_amount?: number | null
          claim_id?: string
          claimed_amount?: number
          clinic_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          discount_amount?: number
          eligible_amount?: number | null
          gross_amount?: number
          id?: string
          item_type?: string
          line_number?: number
          metadata?: Json
          organization_id?: string
          patient_responsibility_amount?: number | null
          payer_responsibility_amount?: number | null
          prescription_item_id?: string | null
          quantity?: number
          revenue_code?: string | null
          service_code?: string | null
          service_date?: string
          source_procedure_reference?: string | null
          status?: string
          supporting_document_id?: string | null
          tax_amount?: number
          unit_price?: number
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_items_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_items_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_items_deleted_by_fk"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_items_prescription_item_fk"
            columns: ["prescription_item_id"]
            isOneToOne: false
            referencedRelation: "prescription_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_items_supporting_document_fk"
            columns: ["supporting_document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_items_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_parties: {
        Row: {
          claim_id: string
          clinic_id: string
          created_at: string
          created_by: string
          display_name_snapshot: string | null
          effective_from: string | null
          effective_to: string | null
          external_party_reference: string | null
          external_party_type: string | null
          id: string
          is_primary: boolean
          metadata: Json
          organization_id: string
          party_role: string
          patient_id: string | null
          updated_at: string
          updated_by: string
          user_profile_id: string | null
        }
        Insert: {
          claim_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          display_name_snapshot?: string | null
          effective_from?: string | null
          effective_to?: string | null
          external_party_reference?: string | null
          external_party_type?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          organization_id: string
          party_role: string
          patient_id?: string | null
          updated_at?: string
          updated_by: string
          user_profile_id?: string | null
        }
        Update: {
          claim_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          display_name_snapshot?: string | null
          effective_from?: string | null
          effective_to?: string | null
          external_party_reference?: string | null
          external_party_type?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          organization_id?: string
          party_role?: string
          patient_id?: string | null
          updated_at?: string
          updated_by?: string
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_parties_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_parties_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_parties_patient_tenant_fk"
            columns: ["organization_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "claim_parties_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_parties_user_profile_fk"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_payment_allocations: {
        Row: {
          allocated_amount: number
          allocation_number: number
          allocation_type: string
          claim_decision_adjustment_id: string | null
          claim_decision_id: string
          claim_id: string
          claim_item_id: string | null
          claim_payment_id: string
          clinic_id: string
          created_at: string
          created_by: string
          currency_code: string
          id: string
          metadata: Json
          organization_id: string
          reason_code: string | null
          reason_text: string | null
        }
        Insert: {
          allocated_amount: number
          allocation_number: number
          allocation_type?: string
          claim_decision_adjustment_id?: string | null
          claim_decision_id: string
          claim_id: string
          claim_item_id?: string | null
          claim_payment_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          currency_code: string
          id?: string
          metadata?: Json
          organization_id: string
          reason_code?: string | null
          reason_text?: string | null
        }
        Update: {
          allocated_amount?: number
          allocation_number?: number
          allocation_type?: string
          claim_decision_adjustment_id?: string | null
          claim_decision_id?: string
          claim_id?: string
          claim_item_id?: string | null
          claim_payment_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          id?: string
          metadata?: Json
          organization_id?: string
          reason_code?: string | null
          reason_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_payment_allocations_adjustment_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_decision_id",
              "claim_decision_adjustment_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_decision_adjustments"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_decision_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_payment_allocations_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_payment_allocations_item_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_item_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_items"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_payment_allocations_payment_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_decision_id",
              "claim_payment_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_payments"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_decision_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_payment_allocations_reason_code_fk"
            columns: ["reason_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      claim_payment_reconciliations: {
        Row: {
          claim_decision_id: string
          claim_id: string
          claim_payment_id: string
          clinic_id: string
          created_at: string
          created_by: string
          currency_code: string
          expected_amount: number
          external_statement_date: string | null
          external_statement_reference: string | null
          id: string
          metadata: Json
          organization_id: string
          received_amount: number
          reconciled_at: string | null
          reconciled_by: string | null
          reconciliation_number: number
          reconciliation_status: string
          resolution_code: string | null
          resolution_text: string | null
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
          updated_by: string
          variance_amount: number | null
          variance_reason_code: string | null
          variance_reason_text: string | null
        }
        Insert: {
          claim_decision_id: string
          claim_id: string
          claim_payment_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          currency_code: string
          expected_amount: number
          external_statement_date?: string | null
          external_statement_reference?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          received_amount: number
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_number: number
          reconciliation_status?: string
          resolution_code?: string | null
          resolution_text?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          updated_by: string
          variance_amount?: number | null
          variance_reason_code?: string | null
          variance_reason_text?: string | null
        }
        Update: {
          claim_decision_id?: string
          claim_id?: string
          claim_payment_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          expected_amount?: number
          external_statement_date?: string | null
          external_statement_reference?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          received_amount?: number
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_number?: number
          reconciliation_status?: string
          resolution_code?: string | null
          resolution_text?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
          updated_by?: string
          variance_amount?: number | null
          variance_reason_code?: string | null
          variance_reason_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_payment_reconciliations_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_payment_reconciliations_payment_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_decision_id",
              "claim_payment_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_payments"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_decision_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_payment_reconciliations_reconciled_by_fk"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_payment_reconciliations_resolution_code_fk"
            columns: ["resolution_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "claim_payment_reconciliations_resolved_by_fk"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_payment_reconciliations_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_payment_reconciliations_variance_reason_code_fk"
            columns: ["variance_reason_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      claim_payments: {
        Row: {
          adjustment_amount: number
          cancellation_reason_code: string | null
          cancellation_reason_text: string | null
          cancelled_at: string | null
          claim_decision_id: string
          claim_id: string
          clinic_id: string
          created_at: string
          created_by: string
          currency_code: string
          external_payload_hash: string | null
          external_source: string
          failed_at: string | null
          failure_code: string | null
          failure_reason: string | null
          gross_payment_amount: number
          id: string
          idempotency_key: string | null
          metadata: Json
          net_payment_amount: number | null
          organization_id: string
          payer_reference: string | null
          payment_method: string
          payment_number: number
          payment_reference: string
          payment_status: string
          processing_started_at: string | null
          received_at: string | null
          remittance_reference: string | null
          reversal_reason_code: string | null
          reversal_reason_text: string | null
          reversed_at: string | null
          scheduled_at: string | null
          updated_at: string
          updated_by: string
          value_date: string | null
          withholding_amount: number
        }
        Insert: {
          adjustment_amount?: number
          cancellation_reason_code?: string | null
          cancellation_reason_text?: string | null
          cancelled_at?: string | null
          claim_decision_id: string
          claim_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          currency_code: string
          external_payload_hash?: string | null
          external_source?: string
          failed_at?: string | null
          failure_code?: string | null
          failure_reason?: string | null
          gross_payment_amount: number
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          net_payment_amount?: number | null
          organization_id: string
          payer_reference?: string | null
          payment_method?: string
          payment_number: number
          payment_reference: string
          payment_status?: string
          processing_started_at?: string | null
          received_at?: string | null
          remittance_reference?: string | null
          reversal_reason_code?: string | null
          reversal_reason_text?: string | null
          reversed_at?: string | null
          scheduled_at?: string | null
          updated_at?: string
          updated_by: string
          value_date?: string | null
          withholding_amount?: number
        }
        Update: {
          adjustment_amount?: number
          cancellation_reason_code?: string | null
          cancellation_reason_text?: string | null
          cancelled_at?: string | null
          claim_decision_id?: string
          claim_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          currency_code?: string
          external_payload_hash?: string | null
          external_source?: string
          failed_at?: string | null
          failure_code?: string | null
          failure_reason?: string | null
          gross_payment_amount?: number
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          net_payment_amount?: number | null
          organization_id?: string
          payer_reference?: string | null
          payment_method?: string
          payment_number?: number
          payment_reference?: string
          payment_status?: string
          processing_started_at?: string | null
          received_at?: string | null
          remittance_reference?: string | null
          reversal_reason_code?: string | null
          reversal_reason_text?: string | null
          reversed_at?: string | null
          scheduled_at?: string | null
          updated_at?: string
          updated_by?: string
          value_date?: string | null
          withholding_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_payments_cancellation_reason_code_fk"
            columns: ["cancellation_reason_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "claim_payments_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_payments_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_payments_decision_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_decision_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_decisions"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_payments_failure_code_fk"
            columns: ["failure_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "claim_payments_reversal_reason_code_fk"
            columns: ["reversal_reason_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "claim_payments_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_policy_coverages: {
        Row: {
          blocking_action: string
          claim_id: string
          clinic_id: string
          coverage_end_date: string | null
          coverage_reason_code: string | null
          coverage_reason_text: string | null
          coverage_start_date: string | null
          coverage_status: string
          created_at: string
          created_by: string
          evaluated_at: string | null
          evaluated_by: string | null
          evaluation_number: number
          evaluation_status: string
          id: string
          member_number_snapshot: string | null
          metadata: Json
          organization_id: string
          payer_name_snapshot: string | null
          payer_reference: string | null
          plan_code_snapshot: string | null
          plan_name_snapshot: string | null
          policy_number_snapshot: string
          policy_snapshot: Json
          result_data: Json
          service_date: string
          source_effective_at: string | null
          source_hash: string | null
          source_reference: string | null
          source_type: string
          source_version: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          blocking_action?: string
          claim_id: string
          clinic_id: string
          coverage_end_date?: string | null
          coverage_reason_code?: string | null
          coverage_reason_text?: string | null
          coverage_start_date?: string | null
          coverage_status?: string
          created_at?: string
          created_by: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          evaluation_number: number
          evaluation_status?: string
          id?: string
          member_number_snapshot?: string | null
          metadata?: Json
          organization_id: string
          payer_name_snapshot?: string | null
          payer_reference?: string | null
          plan_code_snapshot?: string | null
          plan_name_snapshot?: string | null
          policy_number_snapshot: string
          policy_snapshot?: Json
          result_data?: Json
          service_date: string
          source_effective_at?: string | null
          source_hash?: string | null
          source_reference?: string | null
          source_type: string
          source_version?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          blocking_action?: string
          claim_id?: string
          clinic_id?: string
          coverage_end_date?: string | null
          coverage_reason_code?: string | null
          coverage_reason_text?: string | null
          coverage_start_date?: string | null
          coverage_status?: string
          created_at?: string
          created_by?: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          evaluation_number?: number
          evaluation_status?: string
          id?: string
          member_number_snapshot?: string | null
          metadata?: Json
          organization_id?: string
          payer_name_snapshot?: string | null
          payer_reference?: string | null
          plan_code_snapshot?: string | null
          plan_name_snapshot?: string | null
          policy_number_snapshot?: string
          policy_snapshot?: Json
          result_data?: Json
          service_date?: string
          source_effective_at?: string | null
          source_hash?: string | null
          source_reference?: string | null
          source_type?: string
          source_version?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_policy_coverages_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_policy_coverages_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_policy_coverages_evaluated_by_fk"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_policy_coverages_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_procedures: {
        Row: {
          authorization_reference: string | null
          claim_id: string
          clinic_id: string
          coding_status: string
          coding_system: string
          coding_version: string
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          drg_relevant: boolean
          id: string
          metadata: Json
          organization_id: string
          practitioner_user_profile_id: string | null
          procedure_code: string
          procedure_date: string
          procedure_description_snapshot: string | null
          procedure_rank: number
          quantity: number
          source_procedure_reference: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          authorization_reference?: string | null
          claim_id: string
          clinic_id: string
          coding_status?: string
          coding_system: string
          coding_version: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          drg_relevant?: boolean
          id?: string
          metadata?: Json
          organization_id: string
          practitioner_user_profile_id?: string | null
          procedure_code: string
          procedure_date: string
          procedure_description_snapshot?: string | null
          procedure_rank: number
          quantity?: number
          source_procedure_reference?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          authorization_reference?: string | null
          claim_id?: string
          clinic_id?: string
          coding_status?: string
          coding_system?: string
          coding_version?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          drg_relevant?: boolean
          id?: string
          metadata?: Json
          organization_id?: string
          practitioner_user_profile_id?: string | null
          procedure_code?: string
          procedure_date?: string
          procedure_description_snapshot?: string | null
          procedure_rank?: number
          quantity?: number
          source_procedure_reference?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_procedures_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_procedures_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_procedures_deleted_by_fk"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_procedures_practitioner_fk"
            columns: ["practitioner_user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_procedures_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      claim_review_findings: {
        Row: {
          claim_id: string
          claim_review_id: string
          clinic_id: string
          created_at: string
          created_by: string
          field_path: string | null
          finding_category: string
          finding_code: string
          finding_status: string
          finding_text: string
          id: string
          metadata: Json
          organization_id: string
          recommended_action: string
          requires_response: boolean
          resolution_code: string | null
          resolution_text: string | null
          resolved_at: string | null
          resolved_by: string | null
          response_due_at: string | null
          severity: string
          source_reference: string | null
          source_type: string
          subject_reference_id: string | null
          subject_type: string
          title: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          claim_id: string
          claim_review_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          field_path?: string | null
          finding_category: string
          finding_code: string
          finding_status?: string
          finding_text: string
          id?: string
          metadata?: Json
          organization_id: string
          recommended_action?: string
          requires_response?: boolean
          resolution_code?: string | null
          resolution_text?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_due_at?: string | null
          severity: string
          source_reference?: string | null
          source_type?: string
          subject_reference_id?: string | null
          subject_type?: string
          title: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          claim_id?: string
          claim_review_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          field_path?: string | null
          finding_category?: string
          finding_code?: string
          finding_status?: string
          finding_text?: string
          id?: string
          metadata?: Json
          organization_id?: string
          recommended_action?: string
          requires_response?: boolean
          resolution_code?: string | null
          resolution_text?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_due_at?: string | null
          severity?: string
          source_reference?: string | null
          source_type?: string
          subject_reference_id?: string | null
          subject_type?: string
          title?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_review_findings_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_review_findings_resolution_code_fk"
            columns: ["resolution_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "claim_review_findings_resolved_by_fk"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_review_findings_review_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "claim_review_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_reviews"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_review_findings_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_reviews: {
        Row: {
          assigned_at: string | null
          assigned_role_snapshot: string | null
          assigned_to: string | null
          claim_id: string
          clinic_id: string
          completed_at: string | null
          completion_reason_code: string | null
          completion_reason_text: string | null
          created_at: string
          created_by: string
          due_at: string | null
          id: string
          idempotency_key: string | null
          metadata: Json
          organization_id: string
          review_number: number
          review_priority: string
          review_status: string
          review_summary: string | null
          review_type: string
          started_at: string | null
          trigger_source: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_role_snapshot?: string | null
          assigned_to?: string | null
          claim_id: string
          clinic_id: string
          completed_at?: string | null
          completion_reason_code?: string | null
          completion_reason_text?: string | null
          created_at?: string
          created_by: string
          due_at?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          organization_id: string
          review_number: number
          review_priority?: string
          review_status?: string
          review_summary?: string | null
          review_type: string
          started_at?: string | null
          trigger_source?: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          assigned_at?: string | null
          assigned_role_snapshot?: string | null
          assigned_to?: string | null
          claim_id?: string
          clinic_id?: string
          completed_at?: string | null
          completion_reason_code?: string | null
          completion_reason_text?: string | null
          created_at?: string
          created_by?: string
          due_at?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          organization_id?: string
          review_number?: number
          review_priority?: string
          review_status?: string
          review_summary?: string | null
          review_type?: string
          started_at?: string | null
          trigger_source?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_reviews_assigned_to_fk"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_reviews_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_reviews_completion_reason_code_fk"
            columns: ["completion_reason_code"]
            isOneToOne: false
            referencedRelation: "decision_reason_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "claim_reviews_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_reviews_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_status_history: {
        Row: {
          changed_at: string
          changed_by: string
          claim_id: string
          clinic_id: string
          correlation_id: string | null
          from_status: string | null
          id: string
          metadata: Json
          organization_id: string
          reason_code: string | null
          reason_text: string | null
          sequence_number: number
          to_status: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          claim_id: string
          clinic_id: string
          correlation_id?: string | null
          from_status?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          reason_code?: string | null
          reason_text?: string | null
          sequence_number: number
          to_status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          claim_id?: string
          clinic_id?: string
          correlation_id?: string | null
          from_status?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          reason_code?: string | null
          reason_text?: string | null
          sequence_number?: number
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_status_history_changed_by_fk"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_status_history_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
        ]
      }
      claim_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_order: number
          is_active: boolean
          name_en: string
          name_th: string | null
          requires_admission: boolean
          supports_stp: boolean
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          name_en: string
          name_th?: string | null
          requires_admission?: boolean
          supports_stp?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          name_en?: string
          name_th?: string | null
          requires_admission?: boolean
          supports_stp?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      claim_validation_overrides: {
        Row: {
          approved_at: string
          approved_by: string
          approved_role_snapshot: string
          claim_id: string
          clinic_id: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          metadata: Json
          organization_id: string
          override_action: string
          override_status: string
          reason_code: string
          reason_text: string
          replacement_blocking_action: string | null
          replacement_result_status: string | null
          replacement_severity: string | null
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          updated_at: string
          updated_by: string
          validation_result_id: string
        }
        Insert: {
          approved_at?: string
          approved_by: string
          approved_role_snapshot: string
          claim_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          override_action: string
          override_status?: string
          reason_code: string
          reason_text: string
          replacement_blocking_action?: string | null
          replacement_result_status?: string | null
          replacement_severity?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          updated_by: string
          validation_result_id: string
        }
        Update: {
          approved_at?: string
          approved_by?: string
          approved_role_snapshot?: string
          claim_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          override_action?: string
          override_status?: string
          reason_code?: string
          reason_text?: string
          replacement_blocking_action?: string | null
          replacement_result_status?: string | null
          replacement_severity?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
          updated_by?: string
          validation_result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_validation_overrides_approved_by_fk"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_validation_overrides_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_validation_overrides_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_validation_overrides_result_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "validation_result_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_validation_results"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_validation_overrides_revoked_by_fk"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_validation_overrides_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_validation_results: {
        Row: {
          actual_value: Json | null
          blocking_action: string
          claim_id: string
          clinic_id: string
          created_at: string
          created_by: string
          evaluated_at: string
          evaluated_by: string | null
          evaluation_source: string
          expected_value: Json | null
          id: string
          message: string
          organization_id: string
          result_code: string | null
          result_data: Json
          result_status: string
          rule_category: string
          rule_code: string
          rule_version: string
          severity: string
          subject_reference_id: string | null
          subject_type: string
          validation_run_id: string
        }
        Insert: {
          actual_value?: Json | null
          blocking_action?: string
          claim_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          expected_value?: Json | null
          id?: string
          message: string
          organization_id: string
          result_code?: string | null
          result_data?: Json
          result_status: string
          rule_category: string
          rule_code: string
          rule_version: string
          severity: string
          subject_reference_id?: string | null
          subject_type?: string
          validation_run_id: string
        }
        Update: {
          actual_value?: Json | null
          blocking_action?: string
          claim_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          expected_value?: Json | null
          id?: string
          message?: string
          organization_id?: string
          result_code?: string | null
          result_data?: Json
          result_status?: string
          rule_category?: string
          rule_code?: string
          rule_version?: string
          severity?: string
          subject_reference_id?: string | null
          subject_type?: string
          validation_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_validation_results_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_validation_results_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_validation_results_evaluated_by_fk"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_validation_results_run_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "validation_run_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_validation_runs"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
        ]
      }
      claim_validation_runs: {
        Row: {
          blocked_count: number
          claim_id: string
          clinic_id: string
          completed_at: string | null
          created_at: string
          created_by: string
          error_code: string | null
          error_message: string | null
          failed_count: number
          id: string
          metadata: Json
          needs_review_count: number
          not_applicable_count: number
          organization_id: string
          passed_count: number
          ruleset_reference: string
          ruleset_snapshot: Json
          ruleset_version: string
          run_status: string
          started_at: string | null
          summary_status: string
          trigger_source: string
          updated_at: string
          updated_by: string
          validation_stage: string
          warning_count: number
        }
        Insert: {
          blocked_count?: number
          claim_id: string
          clinic_id: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          error_code?: string | null
          error_message?: string | null
          failed_count?: number
          id?: string
          metadata?: Json
          needs_review_count?: number
          not_applicable_count?: number
          organization_id: string
          passed_count?: number
          ruleset_reference: string
          ruleset_snapshot?: Json
          ruleset_version: string
          run_status?: string
          started_at?: string | null
          summary_status?: string
          trigger_source: string
          updated_at?: string
          updated_by: string
          validation_stage: string
          warning_count?: number
        }
        Update: {
          blocked_count?: number
          claim_id?: string
          clinic_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          error_code?: string | null
          error_message?: string | null
          failed_count?: number
          id?: string
          metadata?: Json
          needs_review_count?: number
          not_applicable_count?: number
          organization_id?: string
          passed_count?: number
          ruleset_reference?: string
          ruleset_snapshot?: Json
          ruleset_version?: string
          run_status?: string
          started_at?: string | null
          summary_status?: string
          trigger_source?: string
          updated_at?: string
          updated_by?: string
          validation_stage?: string
          warning_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_validation_runs_claim_tenant_fk"
            columns: ["organization_id", "clinic_id", "claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["organization_id", "clinic_id", "id"]
          },
          {
            foreignKeyName: "claim_validation_runs_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_validation_runs_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_waiting_period_results: {
        Row: {
          blocking_action: string
          claim_id: string
          clinic_id: string
          created_at: string
          created_by: string
          effective_date: string
          elapsed_days: number
          evaluated_at: string
          evaluated_by: string | null
          evaluation_source: string
          field_path: string | null
          id: string
          organization_id: string
          policy_coverage_id: string
          reason_code: string | null
          reason_text: string | null
          remaining_days: number
          required_days: number
          result_data: Json
          result_status: string
          rule_code: string
          rule_definition_hash: string | null
          rule_version: string
          service_date: string
          subject_reference_id: string | null
          subject_type: string
          waiting_period_code: string
          waiting_period_type: string
        }
        Insert: {
          blocking_action?: string
          claim_id: string
          clinic_id: string
          created_at?: string
          created_by: string
          effective_date: string
          elapsed_days: number
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          field_path?: string | null
          id?: string
          organization_id: string
          policy_coverage_id: string
          reason_code?: string | null
          reason_text?: string | null
          remaining_days: number
          required_days: number
          result_data?: Json
          result_status: string
          rule_code: string
          rule_definition_hash?: string | null
          rule_version: string
          service_date: string
          subject_reference_id?: string | null
          subject_type?: string
          waiting_period_code: string
          waiting_period_type: string
        }
        Update: {
          blocking_action?: string
          claim_id?: string
          clinic_id?: string
          created_at?: string
          created_by?: string
          effective_date?: string
          elapsed_days?: number
          evaluated_at?: string
          evaluated_by?: string | null
          evaluation_source?: string
          field_path?: string | null
          id?: string
          organization_id?: string
          policy_coverage_id?: string
          reason_code?: string | null
          reason_text?: string | null
          remaining_days?: number
          required_days?: number
          result_data?: Json
          result_status?: string
          rule_code?: string
          rule_definition_hash?: string | null
          rule_version?: string
          service_date?: string
          subject_reference_id?: string | null
          subject_type?: string
          waiting_period_code?: string
          waiting_period_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_waiting_period_results_coverage_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "policy_coverage_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_policy_coverages"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claim_waiting_period_results_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_waiting_period_results_evaluated_by_fk"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          claim_number: string
          claim_type_code: string
          clinic_id: string
          closed_at: string | null
          created_at: string
          created_by: string
          currency_code: string
          current_ai_assessment_id: string | null
          current_decision_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          member_reference: string | null
          organization_id: string
          patient_id: string
          payer_id: string | null
          payer_reference: string | null
          policy_reference: string | null
          risk_level: string | null
          service_end_date: string | null
          service_start_date: string
          status: string
          submitted_at: string | null
          total_approved_amount: number | null
          total_claimed_amount: number
          total_eligible_amount: number | null
          total_paid_amount: number
          updated_at: string
          updated_by: string
          version: number
          visit_id: string | null
        }
        Insert: {
          claim_number: string
          claim_type_code: string
          clinic_id: string
          closed_at?: string | null
          created_at?: string
          created_by: string
          currency_code?: string
          current_ai_assessment_id?: string | null
          current_decision_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          member_reference?: string | null
          organization_id: string
          patient_id: string
          payer_id?: string | null
          payer_reference?: string | null
          policy_reference?: string | null
          risk_level?: string | null
          service_end_date?: string | null
          service_start_date: string
          status?: string
          submitted_at?: string | null
          total_approved_amount?: number | null
          total_claimed_amount?: number
          total_eligible_amount?: number | null
          total_paid_amount?: number
          updated_at?: string
          updated_by: string
          version?: number
          visit_id?: string | null
        }
        Update: {
          claim_number?: string
          claim_type_code?: string
          clinic_id?: string
          closed_at?: string | null
          created_at?: string
          created_by?: string
          currency_code?: string
          current_ai_assessment_id?: string | null
          current_decision_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          member_reference?: string | null
          organization_id?: string
          patient_id?: string
          payer_id?: string | null
          payer_reference?: string | null
          policy_reference?: string | null
          risk_level?: string | null
          service_end_date?: string | null
          service_start_date?: string
          status?: string
          submitted_at?: string | null
          total_approved_amount?: number | null
          total_claimed_amount?: number
          total_eligible_amount?: number | null
          total_paid_amount?: number
          updated_at?: string
          updated_by?: string
          version?: number
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_claim_type_fk"
            columns: ["claim_type_code"]
            isOneToOne: false
            referencedRelation: "claim_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "claims_clinic_tenant_fk"
            columns: ["organization_id", "clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "claims_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_current_decision_claim_fk"
            columns: [
              "organization_id",
              "clinic_id",
              "id",
              "current_decision_id",
            ]
            isOneToOne: false
            referencedRelation: "claim_decisions"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "claim_id",
              "id",
            ]
          },
          {
            foreignKeyName: "claims_deleted_by_fk"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_organization_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_patient_tenant_fk"
            columns: ["organization_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "claims_updated_by_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_visit_tenant_fk"
            columns: ["organization_id", "clinic_id", "patient_id", "visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: [
              "organization_id",
              "clinic_id",
              "patient_id",
              "id",
            ]
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
      clinical_documents: {
        Row: {
          checksum_sha256: string | null
          clinic_id: string
          correlation_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          document_status: string
          document_type: string
          file_size_bytes: number
          id: string
          is_active: boolean
          mime_type: string
          organization_id: string
          original_filename: string
          patient_id: string
          source_type: string
          storage_bucket: string
          storage_path: string
          supersedes_document_id: string | null
          title: string | null
          updated_at: string
          updated_by: string | null
          uploaded_by: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          visit_id: string | null
        }
        Insert: {
          checksum_sha256?: string | null
          clinic_id: string
          correlation_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          document_status?: string
          document_type: string
          file_size_bytes: number
          id?: string
          is_active?: boolean
          mime_type: string
          organization_id: string
          original_filename: string
          patient_id: string
          source_type?: string
          storage_bucket?: string
          storage_path: string
          supersedes_document_id?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
          uploaded_by?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          visit_id?: string | null
        }
        Update: {
          checksum_sha256?: string | null
          clinic_id?: string
          correlation_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          document_status?: string
          document_type?: string
          file_size_bytes?: number
          id?: string
          is_active?: boolean
          mime_type?: string
          organization_id?: string
          original_filename?: string
          patient_id?: string
          source_type?: string
          storage_bucket?: string
          storage_path?: string
          supersedes_document_id?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
          uploaded_by?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_documents_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_supersedes_document_id_fkey"
            columns: ["supersedes_document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_documents_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
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
      decision_reason_codes: {
        Row: {
          applies_to: string
          category: string
          code: string
          created_at: string
          description: string | null
          display_order: number
          is_active: boolean
          is_blocking: boolean
          name_en: string
          name_th: string | null
          updated_at: string
        }
        Insert: {
          applies_to?: string
          category: string
          code: string
          created_at?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          is_blocking?: boolean
          name_en: string
          name_th?: string | null
          updated_at?: string
        }
        Update: {
          applies_to?: string
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          is_blocking?: boolean
          name_en?: string
          name_th?: string | null
          updated_at?: string
        }
        Relationships: []
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
      prescription_safety_alerts: {
        Row: {
          alert_status: string
          alert_type: string
          clinic_id: string
          correlation_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          evidence: Json
          id: string
          is_active: boolean
          message: string
          organization_id: string
          override_reason: string | null
          prescription_id: string
          prescription_item_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          source_reference: string | null
          source_type: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          alert_status?: string
          alert_type: string
          clinic_id: string
          correlation_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          evidence?: Json
          id?: string
          is_active?: boolean
          message: string
          organization_id: string
          override_reason?: string | null
          prescription_id: string
          prescription_item_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity: string
          source_reference?: string | null
          source_type?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          alert_status?: string
          alert_type?: string
          clinic_id?: string
          correlation_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          evidence?: Json
          id?: string
          is_active?: boolean
          message?: string
          organization_id?: string
          override_reason?: string | null
          prescription_id?: string
          prescription_item_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          source_reference?: string | null
          source_type?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_safety_alerts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_safety_alerts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_safety_alerts_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_safety_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_safety_alerts_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_safety_alerts_prescription_item_id_fkey"
            columns: ["prescription_item_id"]
            isOneToOne: false
            referencedRelation: "prescription_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_safety_alerts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_safety_alerts_updated_by_fkey"
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
      validation_categories: {
        Row: {
          code: string
          created_at: string
          default_severity: string
          description: string | null
          display_order: number
          is_active: boolean
          is_blocking_by_default: boolean
          name_en: string
          name_th: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          default_severity?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          is_blocking_by_default?: boolean
          name_en: string
          name_th?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          default_severity?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          is_blocking_by_default?: boolean
          name_en?: string
          name_th?: string | null
          updated_at?: string
        }
        Relationships: []
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
      visit_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          clinic_id: string
          correlation_id: string
          from_status: Database["public"]["Enums"]["visit_status"] | null
          id: string
          organization_id: string
          reason: string | null
          to_status: Database["public"]["Enums"]["visit_status"]
          visit_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          clinic_id: string
          correlation_id?: string
          from_status?: Database["public"]["Enums"]["visit_status"] | null
          id?: string
          organization_id: string
          reason?: string | null
          to_status: Database["public"]["Enums"]["visit_status"]
          visit_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          clinic_id?: string
          correlation_id?: string
          from_status?: Database["public"]["Enums"]["visit_status"] | null
          id?: string
          organization_id?: string
          reason?: string | null
          to_status?: Database["public"]["Enums"]["visit_status"]
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_status_history_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_status_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_status_history_visit_id_fkey"
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

