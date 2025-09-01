import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { CreateTaskInput } from '../../../server/src/schema';

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, isLoading = false }: TaskFormProps) {
  const [taskTitle, setTaskTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const taskData: CreateTaskInput = {
      title: taskTitle.trim()
    };

    try {
      await onSubmit(taskData);
      setTaskTitle('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <Card className="mb-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm glass-card hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <Plus className="w-5 h-5 text-blue-600" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            placeholder="What needs to be done? ✨"
            value={taskTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskTitle(e.target.value)}
            className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-400 focus-ring transition-colors duration-200"
            disabled={isLoading}
            autoComplete="off"
            maxLength={200}
            autoFocus
          />
          <Button 
            type="submit" 
            disabled={isLoading || !taskTitle.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 focus-ring transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="spinner"></div>
                Adding...
              </span>
            ) : (
              'Add Task'
            )}
          </Button>
        </form>
        {taskTitle.length > 180 && (
          <p className="text-sm text-orange-600 mt-2">
            {200 - taskTitle.length} characters remaining
          </p>
        )}
      </CardContent>
    </Card>
  );
}