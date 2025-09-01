import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, Circle, Trash2 } from 'lucide-react';
import type { Task } from '../../../server/src/schema';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (task: Task) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export function TaskItem({ task, onToggleStatus, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const StatusIcon = isCompleted ? CheckCircle : Circle;
  
  return (
    <div 
      className={`
        task-item flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 
        hover:shadow-md transition-all duration-200 hover-lift
        ${isCompleted ? 'task-completed' : ''}
      `}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggleStatus(task)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleStatus(task);
          }
        }}
        className={`
          p-1 h-8 w-8 transition-colors duration-200 focus-ring
          ${isCompleted 
            ? 'text-green-600 hover:text-orange-500 hover:bg-orange-50' 
            : 'text-orange-500 hover:text-green-600 hover:bg-green-50'
          }
        `}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
      >
        <StatusIcon className="w-5 h-5" />
      </Button>
      
      <div className="flex-1 min-w-0">
        <p className={`
          font-medium break-words status-transition
          ${isCompleted 
            ? 'text-gray-600 line-through' 
            : 'text-gray-800'
          }
        `}>
          {task.title}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Created {task.created_at.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>
      
      <Badge 
        variant="outline" 
        className={`
          transition-colors duration-200
          ${isCompleted 
            ? 'text-green-600 border-green-200 bg-green-50' 
            : 'text-orange-600 border-orange-200 bg-orange-50'
          }
        `}
      >
        {isCompleted ? '✅ Completed' : '⏳ Pending'}
      </Badge>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 focus-ring transition-colors duration-200"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{task.title}"</strong>? 
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(task.id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}