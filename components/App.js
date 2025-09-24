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
        <!-- Modals -->
        <task-form v-if="showForm"
                   @close="showForm=false"
                   @create="onCreate"></task-form>

        <dueDate-form v-if="showDueDateForm"
                   @close="showDueDateForm=false"
                   @create="onCreateDueDateForm"></dueDate-form>

        <!-- Stats + Clear Completed -->
        <div class="flex items-center justify-between mb-4" role="status" aria-live="polite">
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
              <span class="opacity-70">Total</span>
              <span class="font-semibold">{{ totalCount }}</span>
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
              <span class="opacity-80">Active</span>
              <span class="font-semibold">{{ activeCount }}</span>
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
              <span class="opacity-80">Completed</span>
              <span class="font-semibold">{{ completedCount }}</span>
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-700">
              <span class="opacity-80">Overdue</span>
              <span class="font-semibold">{{ overdueCount }}</span>
            </span>
          </div>

          <button
            v-if="completedCount"
            class="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
            @click="clearCompleted">
            Clear completed ({{ completedCount }})
          </button>
        </div>

        <!-- Task list -->
        <ul v-if="tasks.length" class="space-y-3">
          <li v-for="t in tasks" :key="t.id" class="bg-white border rounded-xl p-3">
            <!-- Row: checkbox + title + due badge -->
            <div class="flex transition-transform duration-300">
                <!-- Todo content -->
                <div class="flex-1 p-3">
                  <!-- Check-off (existing feature) -->
                  <input type="checkbox"
                         class="mt-1 w-5 h-5"
                         :checked="t.completed"
                         @change="toggleComplete(t)" />
    
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold flex justify-between items-center">
                      <span :class="{'line-through text-slate-400': t.completed}">
                        {{ t.title }}
                      </span>
                      <!-- Due badge (unchanged logic) -->
                      <div v-if="true"
                           :id="t.id"
                           class="rounded-lg scale-[85%] w-fit px-1 font-normal text-white"
                           :class="getDueDateBgClass(t.dueDate)">
                           {{ getDueDateContent(t.dueDate) }}
                      </div>
                    </div>
    
                    <!-- Description -->
                    <div v-if="t.description" class="text-sm text-slate-600 whitespace-pre-wrap mt-1">
                      {{ t.description }}
                    </div>
    
                    <!-- Due date text + edit button -->
                    <div class="flex gap-4 items-center mt-2">
                      <span>{{ t.dueDate }}</span>
                      <div @click="openDueDateForm"
                           v-if="true"
                           :id="t.id"
                           class="rounded-[50%] bg-green-700 w-fit px-1 text-white hover:scale-[110%] cursor-pointer">✎</div>
                    </div>
                </div>
                <div class="w-0 group-hover:w-16 bg-red-500 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden"
                     @click="deleteTask(t.id)"
                     title="Delete Task">
                  <span class="text-white text-xl font-bold whitespace-nowrap">✕</span>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <p v-else class="text-gray-500 text-center">No tasks yet. Click “New Task”.</p>
      </main>
    </div>
    `,
    components: {'task-form': TaskForm, 'dueDate-form': DueDateForm},
    data() {
        return {
            showForm: false,
            q: '',
            tasks: this.loadTasks(),
            showDueDateForm: false,
            editingTaskId: null
        };
    },
    computed: {
        completedCount() {
            return this.tasks.filter(t => t.completed).length;
        },
        totalCount() {
            return this.tasks.length;
        },
        activeCount() {
            return this.tasks.filter(t => !t.completed).length;
        },
        overdueCount() {
            const now = new Date();
            return this.tasks.filter(t => {
                if (t.completed) return false;
                if (!t.dueDate || t.dueDate === 'No due date') return false;
                const d = new Date(t.dueDate);
                if (isNaN(d.getTime())) return false;
                return d < now;
            }).length;
        },
    },
    methods: {
        openForm() {
            this.showForm = true;
        },

        openDueDateForm(e) {
            const id = e.target.id;
            this.editingTaskId = id;
            this.showDueDateForm = true;
        },

        uid() {
            return Math.random().toString(36).slice(2) + Date.now().toString(36);
        },

        saveTasks() {
            localStorage.setItem('scu.todo.tasks.v1', JSON.stringify(this.tasks));
        },

        loadTasks() {
            try {
                const tasks = JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
                return tasks.map(task => ({
                    completed: false,
                    completedAt: null,
                    ...task,
                    dueDate: typeof task.dueDate === 'undefined' ? 'No due date' : task.dueDate
                }));
            } catch {
                return [];
            }
        },

        onCreate(payload) {
            const title = String(payload.title || '').trim();
            const description = String(payload.description || '').trim();
            let dueDate = String(payload.dueDate || '').trim();

            if (dueDate !== '') {
                const dueDate = new Date(payload.dueDate).toISOString();
            } else if (!dueDate) {
                dueDate = "No due date";
            }

            if (!title) return;

            const task = {
                id: this.uid(),
                title,
                description,
                dueDate,
                completed: false,
                completedAt: null,
                createdAt: new Date().toISOString()
            };

            this.tasks = [task, ...this.tasks].sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
            this.saveTasks();
            this.showForm = false;
        },
        deleteTask(taskId) {
            // Remove the task with the given id
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
        },

        onCreateDueDateForm(payload) {
            const dueDate = String(payload.dueDate || '').trim();
            if (!dueDate || !this.editingTaskId) {
                this.showDueDateForm = false;
                return;
            }
            this.tasks = this.tasks.map(task =>
                task.id === this.editingTaskId ? {...task, dueDate} : task
            );
            this.saveTasks();
            this.showDueDateForm = false;
            this.editingTaskId = null;
        },

        toggleComplete(t) {
            t.completed = !t.completed;
            t.completedAt = t.completed ? new Date().toISOString() : null;
            this.saveTasks();
        },

        clearCompleted() {
            if (!this.completedCount) return;
            if (!confirm('Remove all completed tasks?')) return;
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
        },

        getDueDateBgClass(dueDate) {
            if (!dueDate || dueDate === "No due date") return 'bg-gray-400';
            const dueDateObj = new Date(dueDate);
            const now = new Date();
            const diffTime = dueDateObj - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return 'bg-red-600';
            if (diffDays === 1) return 'bg-orange-500';
            if (diffDays <= 3 && diffDays >= 1) return 'bg-yellow-400';
            if (diffDays > 3) return 'bg-green-600';
            if (diffDays <= 1) return 'bg-black';
        },
        getDueDateContent(dueDate) {
            if (!dueDate || dueDate === "No due date") return 'No due date';
            const dueDateObj = new Date(dueDate);
            const now = new Date();
            const diffTime = dueDateObj - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return 'Due today';
            if (diffDays === 1) return 'Due tomorrow';
            if (diffDays <= 1) return 'Overdue';
            return `Due in ${diffDays} days`;
        }
    }
};
