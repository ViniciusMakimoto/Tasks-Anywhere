export type TaskStatus = 'pending' | 'completed' | 'archived';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // Formato YYYY-MM-DD
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  source?: 'manual' | 'audio' | 'image' | 'chat';
  imageUrl?: string;
  clarificationNeeded?: boolean;
  clarificationQuestion?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
  subtasks?: Array<Omit<Subtask, 'id'> | string>;
  source?: 'manual' | 'audio' | 'image' | 'chat';
  imageUrl?: string;
  clarificationNeeded?: boolean;
  clarificationQuestion?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
  clarificationNeeded?: boolean;
  clarificationQuestion?: string;
}
