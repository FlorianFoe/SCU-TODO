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
          <button
            class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            @click="openImportForm"
            title="Import Tasks"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button
            class="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            @click="exportTasks"
            title="Export Tasks"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
          <button class="px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold" @click="openNewTaskForm">New Task</button>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Modals -->
      <task-form v-if="showForm" @close="showForm=false" @create="onCreate"></task-form>
      <edit-task-form v-if="showEditForm" :task="editingTask" @close="showEditForm=false" @save="onEditTask"></edit-task-form>
      <import-form v-if="showImportForm" @close="showImportForm=false" @import="onImport"></import-form>

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

        <button v-if="completedCount" class="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition" @click="clearCompleted">
          Clear completed ({{ completedCount }})
        </button>
      </div>

      <!-- Task list -->
      <ul v-if="tasks.length" class="space-y-3">
        <li
          v-for="(t, i) in tasks"
          :key="t.id"
          draggable="true"
          @dragstart="onDragStart(i)"
          @dragover="onDragOver(i, $event)"
          @drop="onDrop(i)"
          class="bg-white border rounded-xl group hover:shadow-md transition-shadow"
        >
          <div class="flex transition-transform duration-300">
            <span class="cursor-move px-2 py-4">&#x2630;</span>

            <div class="flex-1">
              <div class="flex gap-3 items-start h-full mb-2 p-3">
                <!-- Check-off -->
                <input type="checkbox" class="mt-1 w-5 h-5" :checked="t.completed" @change="toggleComplete(t)" />

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-lg font-semibold" :class="{'line-through text-slate-400': t.completed}">
                    {{ t.title }}
                  </div>

                  <div class="mt-2 mb-3 flex gap-1 min-w-[160px]">
                    <!-- Status badge as selector -->
                    <div class="relative" @click.stop>
                      <button
                        class="inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium text-white shadow-sm"
                        :class="statusBadgeClass(t.status)"
                        :aria-expanded="statusMenuFor===t.id"
                        aria-haspopup="listbox"
                        @click="toggleStatusMenu(t)"
                        title="Change status"
                      >
                        {{ t.status || (t.completed ? 'Completed' : 'To Do') }}
                        <span class="ml-1 text-white/80">▼</span>
                      </button>

                      <div
                        v-if="statusMenuFor===t.id"
                        class="absolute left-0 top-full mt-1 z-20 w-32 sm:w-40 bg-white border rounded-md shadow-md p-1 text-xs max-h-40 overflow-auto"
                        role="listbox"
                        @keydown.esc="closeStatusMenu"
                      >
                        <button class="w-full flex items-center gap-1.5 rounded px-2 py-1 hover:bg-slate-100" @click="chooseStatus(t, 'To Do')" role="option">
                          <span class="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                          <span class="text-slate-700">To Do</span>
                        </button>
                        <button class="w-full flex items-center gap-1.5 rounded px-2 py-1 hover:bg-slate-100" @click="chooseStatus(t, 'In Progress')" role="option">
                          <span class="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                          <span class="text-blue-700">In Progress</span>
                        </button>
                        <button class="w-full flex items-center gap-1.5 rounded px-2 py-1 hover:bg-slate-100" @click="chooseStatus(t, 'Completed')" role="option">
                          <span class="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                          <span class="text-emerald-700">Completed</span>
                        </button>
                      </div>
                    </div>

                    <!-- Due-date badge -->
                    <div
                      v-if="t.dueDate && t.dueDate !== 'No due date'"
                      :id="t.id"
                      class="inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium text-white shadow-sm"
                      :class="getDueDateBgClass(t.dueDate)"
                    >
                      {{ getDueDateContent(t.dueDate) }}
                    </div>
                  </div>

                  <!-- Priority Selector -->
                  <div class="text-sm text-slate-400">Priority:
                    <span :class="getPriorityBoxColour(t, n)" v-for="n in 5" :key="n" @click="setPriority(t, n)">
                      {{ n <= (t.priority || 0) ? '\\u25A0' : '\\u25A1' }}
                    </span>
                  </div>

                  <!-- Description -->
                  <div v-if="t.description" class="text-sm text-slate-600 whitespace-pre-wrap mt-1 max-w-lg">
                    {{ t.description }}
                  </div>
                </div>

                <!-- Right rail: edit/delete -->
                <div class="w-0 group-hover:w-16 overflow-hidden rounded-r-xl flex flex-col self-stretch transition-all duration-300">
                  <div
                    class="flex-1 bg-blue-500 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-all duration-300"
                    @click="openEditForm(t)"
                    :data-task-id="t.id"
                    title="Edit Task"
                  >
                    <span class="text-white text-xl font-bold whitespace-nowrap">✎</span>
                  </div>
                  <div
                    class="flex-1 bg-red-500 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-all duration-300"
                    @click="deleteTask(t.id)"
                    title="Delete Task"
                  >
                    <span class="text-white text-xl font-bold whitespace-nowrap">✕</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <p v-else class="text-gray-500 text-center">No tasks yet. Click “New Task”.</p>

      <!-- Import confirmation dialog (single instance, outside list) -->
      <div
        v-if="showImportConfirm"
        title="Import Confirmation Dialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      >
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
    </main>
  </div>
  `,

    components: {
        'task-form': TaskForm,
        'edit-task-form': EditTaskForm,
        'import-form': ImportForm,
    },

    data() {
        return {
            showForm: false,
            showEditForm: false,
            showImportForm: false,
            tasks: this.loadTasks(),
            editingTask: null,
            q: '',
            // Import preview + confirmation
            showImportConfirm: false,
            importedTasksPreview: [],
            // Status dropdown
            statusMenuFor: null,
            // Drag-and-drop
            draggedIndex: null,
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

    mounted() {
        // Close status menu on outside click
        this._onOutsideClick = (e) => {
            if (!this.$el.contains(e.target)) this.statusMenuFor = null;
        };
        document.addEventListener('click', this._onOutsideClick);
    },

    beforeUnmount() {
        document.removeEventListener('click', this._onOutsideClick);
    },

    methods: {
        // UI openers
        openNewTaskForm() {
            this.showForm = true;
        },
        openEditForm(task) {
            this.editingTask = { ...task };
            this.showEditForm = true;
        },
        openImportForm() {
            this.showImportForm = true;
        },

        // ID + storage
        uid() {
            return Math.random().toString(36).slice(2) + Date.now().toString(36);
        },
        saveTasks() {
            localStorage.setItem('scu.todo.tasks.v1', JSON.stringify(this.tasks));
        },
        loadTasks() {
            try {
                const tasks = JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
                return tasks.map(task => {
                    const t = {
                        completed: false,
                        completedAt: null,
                        status: 'To Do',
                        priority: 0,
                        ...task,
                        dueDate: typeof task.dueDate === 'undefined' ? 'No due date' : task.dueDate
                    };
                    if (!('status' in task)) t.status = t.completed ? 'Completed' : 'To Do';
                    if (typeof t.priority !== 'number') t.priority = 0;
                    return t;
                });
            } catch {
                return [];
            }
        },

        // Create / Edit / Delete
        onCreate(payload) {
            // Use shared util to keep schema consistent
            const base = TaskUtils.createTask(payload) || {};
            if (!base.title) return;

            const task = {
                id: base.id || this.uid(),
                title: base.title,
                description: base.description || '',
                dueDate: base.dueDate ? String(base.dueDate) : 'No due date',
                completed: !!base.completed,
                completedAt: base.completed ? (base.completedAt || new Date().toISOString()) : null,
                createdAt: base.createdAt || new Date().toISOString(),
                status: base.status || (base.completed ? 'Completed' : 'To Do'),
                priority: typeof base.priority === 'number' ? base.priority : 0,
            };

            this.tasks = [task, ...this.tasks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            this.saveTasks();
            this.showForm = false;
        },
        onEditTask(updatedTask) {
            this.tasks = this.tasks.map(task => task.id === updatedTask.id ? { ...task, ...updatedTask } : task);
            this.saveTasks();
            this.showEditForm = false;
            this.editingTask = null;
        },
        deleteTask(taskId) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
        },

        // Complete + status
        toggleComplete(t) {
            t.completed = !t.completed;
            t.completedAt = t.completed ? new Date().toISOString() : null;
            t.status = t.completed ? 'Completed' : (t.status === 'Completed' ? 'To Do' : t.status || 'To Do');
            this.saveTasks();
        },
        clearCompleted() {
            if (!this.completedCount) return;
            if (!confirm('Remove all completed tasks?')) return;
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
        },
        toggleStatusMenu(task) {
            this.statusMenuFor = (this.statusMenuFor === task.id) ? null : task.id;
        },
        closeStatusMenu() {
            this.statusMenuFor = null;
        },
        chooseStatus(t, status) {
            t.status = status;
            if (status === 'Completed') {
                if (!t.completed) t.completedAt = new Date().toISOString();
                t.completed = true;
            } else {
                t.completed = false;
                t.completedAt = null;
            }
            this.saveTasks();
            this.closeStatusMenu();
        },
        statusBadgeClass(s) {
            switch (s) {
                case 'Completed': return 'bg-emerald-600';
                case 'In Progress': return 'bg-blue-600';
                default: return 'bg-slate-600';
            }
        },

        // Import / Export (with v1 fix: preview + sanitisation + confirm)
        onImport(payload) {
            const file = payload.tasksFile;
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (!Array.isArray(imported)) {
                        alert('Imported file must contain an array of tasks.');
                        return;
                    }

                    // Use TaskUtils.createTask to normalise each item; ensure required fields and IDs
                    const sanitizedTasks = imported
                        .map(t => TaskUtils.createTask(t))
                        .filter(t => t && t.title)
                        .map(t => ({
                            id: t.id || this.uid(),
                            title: String(t.title),
                            description: t.description ? String(t.description) : '',
                            dueDate: t.dueDate ? String(t.dueDate) : 'No due date',
                            completed: !!t.completed,
                            completedAt: t.completed ? (t.completedAt || new Date().toISOString()) : null,
                            createdAt: t.createdAt || new Date().toISOString(),
                            status: t.status || (t.completed ? 'Completed' : 'To Do'),
                            priority: typeof t.priority === 'number' ? t.priority : 0,
                        }));

                    if (sanitizedTasks.length) {
                        this.importedTasksPreview = sanitizedTasks;
                        this.showImportConfirm = true;
                    } else {
                        alert('No valid tasks found in the file.');
                    }
                } catch {
                    alert('Failed to import tasks. Please ensure the file is valid JSON.');
                }
            };
            reader.readAsText(file);
        },
        confirmImport() {
            this.tasks = [...this.importedTasksPreview, ...this.tasks]
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            this.showImportConfirm = false;
            this.importedTasksPreview = [];
            this.saveTasks();
        },
        cancelImport() {
            this.showImportConfirm = false;
            this.importedTasksPreview = [];
        },
        exportTasks() {
            if (this.tasks.length === 0) {
                alert('No tasks to export.');
                return;
            }
            const exportData = this.tasks.map(task => TaskUtils.createTask(task));
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const currentDate = new Date().toISOString().split('T')[0];
            const filename = `tasks-${currentDate}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        // Due date helpers
        getDueDateBgClass(dueDate) {
            if (!dueDate || dueDate === 'No due date') return 'bg-gray-400';
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
            if (!dueDate || dueDate === 'No due date') return 'No due date';
            const dueDateObj = new Date(dueDate);
            const now = new Date();
            const diffTime = dueDateObj - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return 'Due today';
            if (diffDays === 1) return 'Due tomorrow';
            if (diffDays <= 1) return 'Overdue';
            return `Due in ${diffDays} days`;
    },

    // Priority helpers
    setPriority(t, n) {
      t.priority = n;
      this.saveTasks();
    },
    getPriorityBoxColour(t, n) {
      const priorityColors = {
        1: 'text-emerald-700',
        2: 'text-green-600',
        3: 'text-yellow-400',
        4: 'text-orange-500',
        5: 'text-red-700'
      };
      const hoverColors = {
        1: 'hover:text-emerald-800',
        2: 'hover:text-green-700',
        3: 'hover:text-yellow-500',
        4: 'hover:text-orange-600',
        5: 'hover:text-red-800'
      };
      const baseClass = 'priority-box relative w-2.5 bottom-[2px] cursor-pointer align-middle';
      const isActive = n <= (t.priority || 0);
      const colorClass = isActive ? priorityColors[n] : 'hover:' + priorityColors[n];
      const hoverClass = isActive ? hoverColors[n] : '';
      return `${baseClass} ${colorClass} ${hoverClass}`;
    },

    // Drag-and-drop
    onDragStart(index) {
      this.draggedIndex = index;
    },
    onDragOver(index, event) {
      event.preventDefault();
    },
    onDrop(index) {
      if (this.draggedIndex === null || this.draggedIndex === index) return;
      const movedTask = this.tasks.splice(this.draggedIndex, 1)[0];
      this.tasks.splice(index, 0, movedTask);
      this.saveTasks();
      this.draggedIndex = null;
    },
  }
};
