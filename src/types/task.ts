export interface Task {
  id: string;
  type: string;
  data: any;
  status: "pending" | "active" | "completed" | "failed";
  createdAt: number;
  processAt?: number; // Optional: Timestamp (ms) for when to run
}
