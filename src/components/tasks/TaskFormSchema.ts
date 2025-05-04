
import { z } from 'zod';
import { Status } from '@/types';

export const progressMap = {
  'notstarted': 0,
  'inprogress': 50,
  'ongoing': 75,
  'complete': 100
};

export const taskFormSchema = z.object({
  title: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  phase_id: z.string().min(1, 'Phase is required'),
  responsible_teams: z.array(z.string()).optional(),
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
  status: z.enum(['notstarted', 'inprogress', 'ongoing', 'complete']),
  progress_summary: z.string().optional()
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
