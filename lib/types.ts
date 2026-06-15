export type UserRole = "admin" | "deck" | "engine";
export type Department = "deck" | "engine" | "admin";
export type VoyageStatus = "Draft" | "Active" | "Complete";
export type VoyagePhase = "Planning" | "Pre-Departure" | "Underway" | "Pre-Arrival" | "Complete";
export type RouteFileType = "RTZ" | "XML" | "CSV" | "GPX" | "KML";
export type HazardPriority = "Routine" | "Important" | "Urgent" | "Safety Critical";
export type HazardStatus = "Active" | "Monitoring" | "Resolved";
export type DocumentScope = "shared" | "voyage";
export type ChecklistInstanceStatus = "Open" | "In Progress" | "Complete";
export type PmsSystem = "Navigation" | "Communications" | "Safety" | "Electrical" | "Propulsion" | "Auxiliary";
export type PmsTaskStatus = "Scheduled" | "In Progress" | "Complete" | "Deferred" | "Unable to Complete";
export type IssueSource = "PMS" | "Checklist" | "Manual";
export type IssuePriority = "Routine" | "Important" | "Urgent" | "Safety Critical";
export type IssueStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type NotificationKind = "task" | "maintenance" | "voyage" | "issue" | "document" | "system";

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
};

export type HeaderContext = {
  vesselName: string;
  activeVoyage: string;
  voyagePhase: VoyagePhase;
};

export type Voyage = {
  id: string;
  voyage_number: string;
  vessel_name: string;
  title: string;
  origin: string | null;
  destination: string | null;
  etd: string | null;
  eta: string | null;
  status: VoyageStatus;
  phase: VoyagePhase;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type VoyageAssignment = {
  id: string;
  voyage_id: string;
  user_id: string;
  role: UserRole;
  assigned_at: string;
};

export type VoyageRouteFile = {
  id: string;
  voyage_id: string;
  file_name: string;
  file_type: RouteFileType;
  storage_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
  replaced_at: string | null;
  is_current: boolean;
};

export type VoyageWaypoint = {
  id: string;
  voyage_id: string;
  route_file_id: string;
  sequence: number;
  name: string | null;
  latitude: number | null;
  longitude: number | null;
  remarks: string | null;
  created_at: string;
};

export type VoyageWeather = {
  id: string;
  voyage_id: string;
  summary: string;
  source_reference: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type VoyageHazard = {
  id: string;
  voyage_id: string;
  title: string;
  location: string | null;
  description: string | null;
  priority: HazardPriority;
  status: HazardStatus;
  source_reference: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SharedDocument = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SharedDocumentVersion = {
  id: string;
  document_id: string;
  version_number: number;
  file_name: string;
  storage_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
};

export type VoyageDocument = {
  id: string;
  voyage_id: string;
  title: string;
  file_name: string;
  storage_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
  tags: string[];
};

export type VoyageReport = {
  id: string;
  voyage_id: string;
  report_type: string;
  file_name: string;
  storage_path: string;
  generated_by: string | null;
  generated_at: string;
  is_current: boolean;
};

export type ChecklistTemplate = {
  id: string;
  name: string;
  department: Department;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ChecklistTemplateItem = {
  id: string;
  template_id: string;
  sequence: number;
  label: string;
  help_text: string | null;
  requires_note: boolean;
  requires_attachment: boolean;
};

export type ChecklistInstance = {
  id: string;
  template_id: string | null;
  voyage_id: string | null;
  title: string;
  department: Department;
  status: ChecklistInstanceStatus;
  assigned_to: string | null;
  created_by: string | null;
  completed_by: string | null;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ChecklistItemResponse = {
  id: string;
  instance_id: string;
  template_item_id: string | null;
  is_complete: boolean;
  note: string | null;
  completed_by: string | null;
  completed_at: string | null;
  updated_at: string;
};

export type ChecklistAttachment = {
  id: string;
  response_id: string;
  file_name: string;
  storage_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
};

export type PmsEquipment = {
  id: string;
  name: string;
  system: PmsSystem;
  description: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PmsTask = {
  id: string;
  equipment_id: string;
  title: string;
  description: string | null;
  interval_days: number | null;
  due_at: string | null;
  assigned_to: string | null;
  status: PmsTaskStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PmsCompletion = {
  id: string;
  task_id: string;
  status: PmsTaskStatus;
  notes: string | null;
  completed_by: string | null;
  completed_at: string;
  next_due_at: string | null;
};

export type PmsAttachment = {
  id: string;
  completion_id: string;
  file_name: string;
  storage_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
};

export type Issue = {
  id: string;
  title: string;
  description: string | null;
  priority: IssuePriority;
  status: IssueStatus;
  department: Department;
  assigned_to: string | null;
  source: IssueSource;
  voyage_id: string | null;
  checklist_instance_id: string | null;
  pms_task_id: string | null;
  created_by: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type IssueAttachment = {
  id: string;
  issue_id: string;
  file_name: string;
  storage_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  related_table: string | null;
  related_id: string | null;
  is_read: boolean;
  acknowledged_at: string | null;
  archived_at: string | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_table: string;
  entity_id: string | null;
  voyage_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};
