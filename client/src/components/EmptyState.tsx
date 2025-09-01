import { Card, CardContent } from '@/components/ui/card';

export function EmptyState() {
  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm glass-card">
      <CardContent className="p-12 text-center">
        <div className="text-8xl mb-6 animate-bounce">🎯</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">
          Ready to get organized?
        </h3>
        <p className="text-gray-500 mb-6 text-lg">
          Create your first task above to start your productivity journey!
        </p>
        <div className="space-y-3 text-sm text-gray-400 max-w-md mx-auto">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-lg">💡</span>
            <span>Click the circle icon to mark tasks as complete</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-lg">🗑️</span>
            <span>Use the trash icon to delete tasks you no longer need</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-lg">📈</span>
            <span>Track your progress with completion statistics</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}