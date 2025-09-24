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
          <task-form v-if="showForm"
                     @close="showForm=false"
                     @create="onCreate"></task-form>
                     
          <dueDate-form v-if="showDueDateForm"
                     @close="showDueDateForm=false"
                     @create="onCreateDueDateForm"></dueDate-form>           

          <ul v-if="tasks.length" class="space-y-3">
            <li v-for="t in tasks" :key="t.id" class="bg-white border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
              <!-- Main content container that slides when hovering -->
              <div class="flex transition-transform duration-300">
                <!-- Todo content -->
                <div class="flex-1 p-3">
                  <div class="font-semibold flex justify-between items-center mb-2">
                      <span>{{ t.title }}</span>
                      <div v-if="true" :id="t.id" class="rounded-lg scale-[85%] w-fit px-1 font-normal text-white" :class="getDueDateBgClass(t.dueDate)">{{getDueDateContent(t.dueDate)}}</div>
                  </div>
                  <div v-if="t.description" class="text-sm text-slate-600 whitespace-pre-wrap mt-1 max-w-lg">{{ t.description }}</div>
                  <div class="flex gap-4 items-center">
                    <span>{{ t.dueDate }}</span>
                    <div @click="openDueDateForm" v-if="true" :id="t.id" class="rounded-[50%] bg-green-700 w-fit px-1 text-white hover:scale-[110%] cursor-pointer">✎</div>
                  </div>
                </div>
                
                <div class="w-0 group-hover:w-16 bg-red-500 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden"
                     @click="deleteTask(t.id)"
                     title="Delete Task">
                  <span class="text-white text-xl font-bold whitespace-nowrap">✕</span>
                </div>
              </div>
            </li>
          </ul>
          <p v-else class="text-gray-500 text-center">No tasks yet. Click “New Task”.</p>
        </main>
    </div>
  `, components: {'task-form': TaskForm, 'dueDate-form': DueDateForm}, data() {
        return {
            showForm: false, q: '', tasks: this.loadTasks(), showDueDateForm: false, editingTaskId: null
        };
    }, methods: {
        openForm() {
            this.showForm = true;
        }, openDueDateForm(e) {
            // Find the task by id and set it as the current editing task
            const id = e.target.id;
            this.editingTaskId = id;
            this.showDueDateForm = true;
        }, uid() {
            return Math.random().toString(36).slice(2) + Date.now().toString(36);
        }, saveTasks() {
            localStorage.setItem('scu.todo.tasks.v1', JSON.stringify(this.tasks));
        }, loadTasks() {
            try {
                const tasks = JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
                return tasks.map(task => ({
                    ...task, dueDate: typeof task.dueDate === 'undefined' ? 'No due date' : task.dueDate
                }));
            } catch {
                return [];
            }
        }, onCreate(payload) {
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
          createdAt: new Date().toISOString()
        };

            this.tasks = [task, ...this.tasks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            this.saveTasks();
            this.showForm = false;
        }, onCreateDueDateForm(payload) {
            const dueDate = String(payload.dueDate || '').trim();
            if (!dueDate || !this.editingTaskId) {
                this.showDueDateForm = false;
                return;
            }
            // Update the due date of the correct task
            this.tasks = this.tasks.map(task => task.id === this.editingTaskId ? {...task, dueDate} : task);
            this.saveTasks();
            this.showDueDateForm = false;
            this.editingTaskId = null;
        }, deleteTask(taskId) {
            // Remove the task with the given id
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
        }, getDueDateBgClass(dueDate) {
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
        }, getDueDateContent(dueDate) {
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
