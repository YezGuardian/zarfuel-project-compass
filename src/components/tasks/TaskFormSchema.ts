
import * as z from 'zod';

export const taskFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  phase_id: z.string({ required_error: "Please select a phase" }),
  responsible_teams: z.array(z.string()).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  status: z.enum(['notstarted', 'inprogress', 'ongoing', 'complete']),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

// Status to progress mapping
export const progressMap = {
  notstarted: 0,
  inprogress: 50,
  ongoing: 70,
  complete: 100
};
