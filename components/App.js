const App = {
    template: `
    <div>
      <!-- Sticky top header -->
      <header class="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div class="max-w-6xl mx-auto p-3 flex items-center gap-3">
          <svg class="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <div class="font-bold">To Do list Task Manager</div>

          <div class="ml-auto flex items-center gap-2">
            <button class="px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold" @click="openForm">New Task</button>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8 max-w-2xl">
        <task-form v-if="showForm" @close="showForm=false" @create="onCreate"></task-form>

        <ul v-if="tasks.length" class="space-y-3">
          <li v-for="t in tasks" :key="t.id" class="bg-white border rounded-xl p-3">
            <div class="font-semibold">{{ t.title }}</div>
            <div v-if="t.description" class="text-sm text-slate-600 whitespace-pre-wrap mt-1">{{ t.description }}</div>
          </li>
        </ul>
        <p v-else class="text-gray-500 text-center">No tasks yet. Click “New”.</p>
      </main>
    </div>
    `,
    components: { 'task-form': TaskForm },
    data(){
      return {
        showForm: false,
        tasks: this.loadTasks(),
        q: ''
      };
    },
        methods:{
      openForm(){ this.showForm = true; },
      uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); },
      saveTasks(){ localStorage.setItem('scu.todo.tasks.v1', JSON.stringify(this.tasks)); },
      loadTasks(){ try { return JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]'); } catch { return []; } },
      onCreate(payload){
        const title = String(payload.title || '').trim();
        const description = String(payload.description || '').trim();
        if (!title) return;

        const task = {
          id: this.uid(),
          title,
          description,            // NEW: persist description
          createdAt: new Date().toISOString()
        };

        this.tasks = [task, ...this.tasks].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
        this.saveTasks();
        this.showForm = false;
      }
    }
  };
