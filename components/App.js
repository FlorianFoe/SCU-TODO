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
          <div class="flex justify-end gap-3 mb-4">
            <button class="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
                    @click="openForm">New Task</button>
            <button class="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold"
                    @click="openImportForm">Import Tasks</button>
          </div>
          
          <import-form v-if="showImportForm"
                        @close="showImportForm=false"
                        @import="onImport"></import-form>
          
          <task-form v-if="showForm"
                     @close="showForm=false"
                     @create="onCreate"></task-form>
                     
          <dueDate-form v-if="showDueDateForm"
                     @close="showDueDateForm=false"
                     @create="onCreateDueDateForm"></dueDate-form>           

          <ul v-if="tasks.length" class="space-y-3">
            <li v-for="t in tasks" :key="t.id" class="bg-white border rounded-xl p-3">
              <div class="font-semibold flex justify-between items-center mb-2">
                  <span>{{ t.title }}</span>
                  <div v-if="t.dueDate.length" :id="t.id" class="rounded-lg scale-[85%] w-fit px-1 font-normal text-white" :class="getDueDateBgClass(t.dueDate)">{{getDueDateContent(t.dueDate)}}</div>
              </div>
              <div class="flex gap-4 items-center">
                <span>{{ t.dueDate }}</span>
                <div @click="openDueDateForm" v-if="t.dueDate.length" :id="t.id" class=" rounded-[50%] bg-green-700 w-fit px-1 text-white hover:scale-[110%] cursor-pointer ">✎</div>
              </div>  
            </li>
          </ul>
          <p v-else class="text-gray-500 text-center">No tasks yet. Click “New Task”.</p>
        </main>
    </div>
  `, components: {'task-form': TaskForm, 'dueDate-form': DueDateForm, 'import-form': ImportForm}, data() {
        return {
            showForm: false, showDueDateForm: false, showImportForm: false, tasks: this.loadTasks(), editingTaskId: null
        };
    }, methods: {
        openForm() {
            this.showForm = true;
        }, openDueDateForm(e) {
            // Find the task by id and set it as the current editing task
            const id = e.target.id;
            this.editingTaskId = id;
            this.showDueDateForm = true;
        }, openImportForm() {
            this.showImportForm = true;
        }, uid() {
            return Math.random().toString(36).slice(2) + Date.now().toString(36);
        }, saveTasks() {
            localStorage.setItem('scu.todo.tasks.v1', JSON.stringify(this.tasks));
        }, loadTasks() {
            try {
                return JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
            } catch {
                return [];
            }
        }, onCreate(payload) {
            const title = String(payload.title || '').trim();
            let dueDate = String(payload.dueDate || '').trim();
            if (dueDate !== '') {
                const dueDate = new Date(payload.dueDate).toISOString();
            } else if (!dueDate) {
                dueDate = "No due date";
            }
            if (!title) return;

            const task = {
                id: this.uid(), title, dueDate, createdAt: new Date().toISOString()
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
        }, onImport(payload) {
            const file = payload.tasksFile;
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedTasks = JSON.parse(e.target.result);
                    if (Array.isArray(importedTasks)) {
                        // Validate and sanitize imported tasks
                        const sanitizedTasks = importedTasks.map(t => ({
                            id: this.uid(),
                            title: String(t.title || '').trim(),
                            dueDate: t.dueDate ? String(t.dueDate).trim() : "No due date",
                            createdAt: new Date().toISOString()
                        })).filter(t => t.title); // Only keep tasks with a title

                        this.tasks = [...sanitizedTasks, ...this.tasks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                        this.saveTasks();
                        this.showDueDateForm = false;
                    } else {
                        alert('Imported file must contain an array of tasks.');
                    }
                } catch {
                    alert('Failed to import tasks. Please ensure the file is a valid JSON.');
                }
            };
            reader.readAsText(file);
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
}
