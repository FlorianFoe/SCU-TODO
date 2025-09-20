const App = {
    template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-blue-600 mb-2">SCU TODO</h1>
        <p class="text-gray-600">Efficient task management</p>
      </header>
      
      <!-- Main content -->
      <main>
          <div class="flex justify-end mb-4">
            <button class="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
                    @click="openForm">New Task</button>
          </div>

          <task-form v-if="showForm"
                     @close="showForm=false"
                     @create="onCreate"></task-form>

          <ul v-if="tasks.length" class="space-y-3">
            <li v-for="t in tasks" :key="t.id" class="bg-white border rounded-xl p-3">
              <div class="font-semibold">{{ t.title }}</div>
              <div class="sm:font-gr">{{ t.dueDate }}</div>
            </li>
          </ul>
          <p v-else class="text-gray-500 text-center">No tasks yet. Click “New Task”.</p>
        </main>
    </div>
  `,
    components: {'task-form': TaskForm},
    data() {
        return {
            showForm: false,
            tasks: this.loadTasks()   // in-memory for now
        };
        // TODO: Add your components here
        //'example': ExampleComponent
    },
    methods: {
        openForm() {
            this.showForm = true;
        },
        uid() {
            return Math.random().toString(36).slice(2) + Date.now().toString(36);
        },
        saveTasks() {
            localStorage.setItem('scu.todo.tasks.v1', JSON.stringify(this.tasks));
        },
        loadTasks() {
            try {
                return JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
            } catch {
                return [];
            }
        },
        onCreate(payload) {
            const title = String(payload.title || '').trim();
            const dueDate = new Date(payload.dueDate);
            if (dueDate.toString() === 'Invalid Date') return;
            if (!title) return;

            const task = {
                id: this.uid(),
                title,
                dueDate: dueDate.toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            };

            this.tasks = [task, ...this.tasks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            this.saveTasks();
            this.showForm = false;
        }
    }
}
