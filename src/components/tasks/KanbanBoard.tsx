
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, Phase } from '@/types';

interface KanbanBoardProps {
  phases: Phase[];
  tasksByPhase: Record<string, Task[]>;
  isAdmin: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ phases, tasksByPhase, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-6">
      {phases.map((phase) => (
        <div key={phase.id} className="min-w-[300px] max-w-[300px]">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">
                PHASE {phase.position}: {phase.name}
                <span className="text-xs rounded-full bg-muted px-2 py-0.5 ml-2">
                  {tasksByPhase[phase.id]?.length || 0}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 py-2">
              <div className="space-y-2">
                {tasksByPhase[phase.id]?.map((task) => (
                  <div
                    key={task.id}
                    className="bg-card border rounded p-3 cursor-pointer hover:border-primary"
                    onClick={() => onEdit(task)}
                  >
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {task.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
