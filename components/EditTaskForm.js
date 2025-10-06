const EditTaskForm = {
  props: ['task'],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 p-4 flex items-start justify-center z-50">
      <div class="bg-white w-full max-w-lg rounded-xl shadow-xl">
        <header class="px-4 py-3 border-b flex items-center justify-between">
          <h3 class="font-semibold">Edit Task</h3>
          <button class="px-2 py-1 border rounded-lg" @click="cancel" aria-label="Close">✖️</button>
        </header>
        
        <form @submit.prevent="save">
          <div class="p-4 space-y-4">
            <!-- Title -->
            <div>
              <label for="title" class="text-sm text-slate-600">
                Title<span class="text-red-600">*</span>
              </label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                required
                class="w-full border rounded-lg px-3 py-2"
                placeholder="Enter task title"
              />
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="text-sm text-slate-600">
                Description
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="4"
                class="w-full border rounded-lg px-3 py-2"
                placeholder="Optional details..."
              ></textarea>
            </div>

            <!-- Due Date -->
            <div>
              <label for="dueDate" class="text-sm text-slate-600">
                Due Date
              </label>
              <input
                id="dueDate"
                v-model="formData.dueDate"
                type="date"
                class="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <!-- Status -->
            <div>
              <label for="status" class="text-sm text-slate-600">
                Status
              </label>
              <div class="relative">
                <!-- Status badge acts as selector -->
                <button
                  type="button"
                  class="w-full inline-flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm"
                  :class="getStatusBadgeClass(formData.status)"
                  :aria-expanded="statusMenuOpen"
                  aria-haspopup="listbox"
                  @click="toggleStatusMenu"
                >
                  {{ formData.status }}
                  <span class="ml-1 text-white/80">▼</span>
                </button>

                <!-- Status menu -->
                <div
                  v-if="statusMenuOpen"
                  class="absolute left-0 top-full mt-1 z-[99999] w-full bg-white border rounded-md shadow-xl p-1 text-sm"
                  role="listbox"
                  @click.stop
                >
                  <button
                    type="button"
                    class="w-full flex items-center gap-2 rounded px-3 py-2 hover:bg-slate-100 text-left"
                    @click="selectStatus('To Do')"
                    role="option"
                  >
                    <span class="h-2 w-2 rounded-full bg-slate-600"></span>
                    <span class="text-slate-700">To Do</span>
                  </button>
                  <button
                    type="button"
                    class="w-full flex items-center gap-2 rounded px-3 py-2 hover:bg-slate-100 text-left"
                    @click="selectStatus('In Progress')"
                    role="option"
                  >
                    <span class="h-2 w-2 rounded-full bg-blue-600"></span>
                    <span class="text-blue-700">In Progress</span>
                  </button>
                  <button
                    type="button"
                    class="w-full flex items-center gap-2 rounded px-3 py-2 hover:bg-slate-100 text-left"
                    @click="selectStatus('Completed')"
                    role="option"
                  >
                    <span class="h-2 w-2 rounded-full bg-emerald-600"></span>
                    <span class="text-emerald-700">Completed</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <footer class="px-4 py-3 border-t flex justify-end gap-2">
            <button
              type="button"
              @click="cancel"
              class="px-4 py-2 border rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </footer>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      formData: {
        title: '',
        description: '',
        dueDate: '',
        status: 'To Do'
      },
      statusMenuOpen: false
    };
  },
  mounted() {
    // Initialize form with task data
    if (this.task) {
      this.formData.title = this.task.title || '';
      this.formData.description = this.task.description || '';
      this.formData.status = this.task.status || 'To Do';

      // Handle due date conversion
      if (this.task.dueDate && this.task.dueDate !== 'No due date') {
        try {
          // Convert ISO date to YYYY-MM-DD format for date input
          const date = new Date(this.task.dueDate);
          if (!isNaN(date.getTime())) {
            this.formData.dueDate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn('Could not parse due date:', this.task.dueDate);
        }
      }
    }
  },
  methods: {
    save() {
      if (!this.formData.title.trim()) {
        alert('Title is required');
        return;
      }

      const updatedTask = {
        ...this.task,
        title: this.formData.title.trim(),
        description: this.formData.description.trim(),
        status: this.formData.status
      };

      // Handle due date
      if (this.formData.dueDate) {
        updatedTask.dueDate = new Date(this.formData.dueDate).toISOString();
      } else {
        updatedTask.dueDate = 'No due date';
      }

      // Handle status change for completion
      if (this.formData.status === 'Completed' && !this.task.completed) {
        updatedTask.completed = true;
        updatedTask.completedAt = new Date().toISOString();
      } else if (this.formData.status !== 'Completed' && this.task.completed) {
        updatedTask.completed = false;
        updatedTask.completedAt = null;
      }

      this.$emit('save', updatedTask);
    },
    cancel() {
      this.$emit('close');
    },
    toggleStatusMenu() {
      this.statusMenuOpen = !this.statusMenuOpen;
    },
    selectStatus(status) {
      this.formData.status = status;
      this.statusMenuOpen = false;
    },
    getStatusBadgeClass(status) {
      switch (status) {
        case 'To Do':
          return 'bg-slate-600';
        case 'In Progress':
          return 'bg-blue-600';
        case 'Completed':
          return 'bg-emerald-600';
        default:
          return '';
      }
    }
  }
};
