import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Task } from '../../../server/src/schema';

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const completedTasks = tasks.filter((task: Task) => task.status === 'completed');
  const pendingTasks = tasks.filter((task: Task) => task.status === 'pending');
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  if (tasks.length === 0) return null;

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm glass-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📊 Task Statistics
            </h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          
          <Progress 
            value={completionPercentage} 
            className="w-full h-3"
            style={{
              background: 'linear-gradient(90deg, #e5e7eb 0%, #e5e7eb 100%)',
            }}
          />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="text-xl font-bold text-blue-600">{tasks.length}</div>
              <div className="text-sm text-blue-700">📋 Total</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <div className="text-xl font-bold text-orange-600">{pendingTasks.length}</div>
              <div className="text-sm text-orange-700">⏳ Pending</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="text-xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-sm text-green-700">✅ Done</div>
            </div>
          </div>
          
          {completedTasks.length > 0 && (
            <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
              <div className="text-sm text-gray-700">
                🎉 Great job! You've completed {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''}
                {pendingTasks.length > 0 && (
                  <span>, {pendingTasks.length} more to go!</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}