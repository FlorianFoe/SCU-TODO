const TaskForm = {
    emits: ['close', 'create'],
    data() {
        return {title: '', dueDate: Date(), error: ''};
    },
    methods: {
        submit() {
            const title = String(this.title || '').trim();
            const dueDate = new Date(this.dueDate);
            if (!dueDate) {
                this.info('No due date.')
            }
            if (!title) {
                this.error = 'Title is required.';
                return;
            }
            this.$emit('create', {title, dueDate});
        }
    },
    template: `
      <div class="fixed inset-0 bg-slate-900/60 p-4 flex items-start justify-center z-50">
        <div class="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
          <header class="px-4 py-3 border-b flex items-center justify-between">
            <h3 class="font-semibold">Add a task</h3>
            <button class="px-2 py-1 border rounded-lg" @click="$emit('close')" aria-label="Close">✖️</button>
          </header>

          <form @submit.prevent="submit">
            <div class="p-4 space-y-3">
              <div>
                <label class="text-sm text-slate-600">Title<span class="text-red-600">*</span></label>
                <input v-model="title" type="text" required class="w-full border rounded-lg px-3 py-2" placeholder="What needs to be done?">
              </div>
              <div>
                <label class="text-sm text-slate-600">Due Date</label>
                <input v-model="dueDate" type="date" class="w-full border rounded-lg px-3 py-2">
              </div>
              
              <p v-if="error" class="text-rose-700 text-sm">{{ error }}</p>
            </div>

            <footer class="px-4 py-3 border-t flex justify-end gap-2">
              <button type="button" class="px-3 py-2 border rounded-lg" @click="$emit('close')">Cancel</button>
              <button type="submit" class="px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Save</button>
            </footer>
          </form>
        </div>
      </div>
    `
};