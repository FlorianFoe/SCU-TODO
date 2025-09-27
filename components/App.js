import {createTask} from "../utils/task.js";


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
            <button class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600" 
                    @click="openImportForm" 
                    title="Import Tasks">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
          
        </div>
      </header>
      
      <!-- Main content -->
      <main class="container mx-auto px-4 py-8 max-w-2xl">
          <div class="flex justify-end gap-3 mb-4">

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
                  <div v-if="true" :id="t.id" class="rounded-lg scale-[85%] w-fit px-1 font-normal text-white" :class="getDueDateBgClass(t.dueDate)">{{getDueDateContent(t.dueDate)}}</div>
              </div>
              <div v-if="t.description" class="text-sm text-slate-600 whitespace-pre-wrap mt-1">{{ t.description }}</div>
              <div class="flex gap-4 items-center">
                <span>{{ t.dueDate }}</span>
                <div @click="openDueDateForm" v-if="true" :id="t.id" class=" rounded-[50%] bg-green-700 w-fit px-1 text-white hover:scale-[110%] cursor-pointer ">✎</div>
              </div>  
            </li>
          </ul>
          <p v-else class="text-gray-500 text-center">No tasks yet. Click “New Task”.</p>
        </main>
        
        <div title="Import Confirmation Dialog" v-if="showImportConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 class="text-lg font-bold mb-2">Import Tasks</h2>
            <p class="mb-3">You are about to import the following tasks:</p>
            <ul class="mb-4 max-h-40 overflow-y-auto">
              <li v-for="t in importedTasksPreview" :key="t.id" class="text-gray-700">• {{ t.title }}</li>
            </ul>
            <div class="flex justify-end gap-2">
              <button @click="cancelImport" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
              <button @click="confirmImport" class="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Confirm</button>
            </div>
          </div>
        </div>

    </div>
  `, components: {
        'task-form': TaskForm, 'dueDate-form': DueDateForm, 'import-form': ImportForm, 'createTask': createTask
    }, data() {
        return {
            showForm: false,
            showDueDateForm: false,
            showImportForm: false,
            tasks: this.loadTasks(),
            editingTaskId: null,
            q: '',
            showImportConfirm: false,
            importedTasksPreview: [],
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

            const task = createTask({title, dueDate, description});
            // TODO: Add new data properties here if needed!!!

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
                        const sanitizedTasks = importedTasks.map(t => createTask(t)).filter(t => t.title);
                        if (sanitizedTasks.length) {
                            this.importedTasksPreview = sanitizedTasks;
                            this.showImportConfirm = true;
                        }
                    } else {
                        alert('Imported file must contain an array of tasks.');
                    }
                } catch {
                    alert('Failed to import tasks. Please ensure the file is a valid JSON.');
                }
            };
            reader.readAsText(file);
        }, confirmImport() {
            this.tasks = [...this.importedTasksPreview, ...this.tasks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            this.showImportConfirm = false;
            this.importedTasksPreview = [];
            this.saveTasks();
        }, cancelImport() {
            this.showImportConfirm = false;
            this.importedTasksPreview = [];
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

export default App;
