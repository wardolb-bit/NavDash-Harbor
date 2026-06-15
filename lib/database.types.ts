import type {
  AuditLog,
  ChecklistAttachment,
  ChecklistInstance,
  ChecklistItemResponse,
  ChecklistTemplate,
  ChecklistTemplateItem,
  Department,
  DocumentScope,
  HazardPriority,
  HazardStatus,
  Issue,
  IssueAttachment,
  IssuePriority,
  IssueSource,
  IssueStatus,
  Notification,
  NotificationKind,
  PmsAttachment,
  PmsCompletion,
  PmsEquipment,
  PmsSystem,
  PmsTask,
  PmsTaskStatus,
  Profile,
  RouteFileType,
  SharedDocument,
  SharedDocumentVersion,
  UserRole,
  Voyage,
  VoyageAssignment,
  VoyageDocument,
  VoyageHazard,
  VoyagePhase,
  VoyageReport,
  VoyageRouteFile,
  VoyageStatus,
  VoyageWaypoint,
  VoyageWeather,
} from "@/lib/types";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: unknown[];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      voyages: Table<Voyage>;
      voyage_assignments: Table<VoyageAssignment>;
      voyage_route_files: Table<VoyageRouteFile>;
      voyage_waypoints: Table<VoyageWaypoint>;
      voyage_weather: Table<VoyageWeather>;
      voyage_hazards: Table<VoyageHazard>;
      shared_documents: Table<SharedDocument>;
      shared_document_versions: Table<SharedDocumentVersion>;
      voyage_documents: Table<VoyageDocument>;
      voyage_reports: Table<VoyageReport>;
      checklist_templates: Table<ChecklistTemplate>;
      checklist_template_items: Table<ChecklistTemplateItem>;
      checklist_instances: Table<ChecklistInstance>;
      checklist_item_responses: Table<ChecklistItemResponse>;
      checklist_attachments: Table<ChecklistAttachment>;
      pms_equipment: Table<PmsEquipment>;
      pms_tasks: Table<PmsTask>;
      pms_completions: Table<PmsCompletion>;
      pms_attachments: Table<PmsAttachment>;
      issues: Table<Issue>;
      issue_attachments: Table<IssueAttachment>;
      notifications: Table<Notification>;
      audit_log: Table<AuditLog>;
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: UserRole | null;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_department_member: {
        Args: { target_department: Department };
        Returns: boolean;
      };
      is_assigned_to_voyage: {
        Args: { target_voyage_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      department: Department;
      voyage_status: VoyageStatus;
      voyage_phase: VoyagePhase;
      route_file_type: RouteFileType;
      hazard_priority: HazardPriority;
      hazard_status: HazardStatus;
      document_scope: DocumentScope;
      checklist_instance_status: ChecklistInstance["status"];
      pms_system: PmsSystem;
      pms_task_status: PmsTaskStatus;
      issue_source: IssueSource;
      issue_priority: IssuePriority;
      issue_status: IssueStatus;
      notification_kind: NotificationKind;
    };
    CompositeTypes: Record<string, never>;
  };
};
