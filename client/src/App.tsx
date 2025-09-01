import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import { TaskStats } from '@/components/TaskStats';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskInput, UpdateTaskStatusInput } from '../../server/src/schema';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getTasks.query();
      setTasks(result);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (taskData: CreateTaskInput) => {
    try {
      setIsCreating(true);
      const newTask = await trpc.createTask.mutate(taskData);
      setTasks((prev: Task[]) => [newTask, ...prev]);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    const updateData: UpdateTaskStatusInput = {
      id: task.id,
      status: newStatus
    };

    try {
      const updatedTask = await trpc.updateTaskStatus.mutate(updateData);
      setTasks((prev: Task[]) => 
        prev.map((t: Task) => t.id === task.id ? updatedTask : t)
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await trpc.deleteTask.mutate({ id: taskId });
      setTasks((prev: Task[]) => prev.filter((t: Task) => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const pendingTasks = tasks.filter((task: Task) => task.status === 'pending');
  const completedTasks = tasks.filter((task: Task) => task.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝 My To-Do List
          </h1>
          <p className="text-gray-600 mb-2">Stay organized and get things done!</p>
          <p className="text-sm text-gray-400">
            💡 Press Tab to navigate, Enter to toggle completion, or click to interact
          </p>
        </div>

        {/* Create Task Form */}
        <TaskForm onSubmit={handleCreateTask} isLoading={isCreating} />

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Tasks Display */}
        {!isLoading && (
          <>
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <Card className="mb-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Circle className="w-5 h-5 text-orange-500" />
                    Pending Tasks ({pendingTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.map((task: Task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <Card className="mb-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Completed Tasks ({completedTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedTasks.map((task: Task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {tasks.length === 0 && <EmptyState />}
          </>
        )}

        {/* Statistics */}
        {!isLoading && <TaskStats tasks={tasks} />}
      </div>
    </div>
  );
}

export default App;