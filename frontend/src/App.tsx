import { TaskList } from '@/components/TaskList';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-200px,hsl(var(--color-primary))_0%,transparent_60%)]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
        <TaskList />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
