const DueDateForm = {
    emits: ['close', 'create'],
    data() {
        return {dueDate: '', error: ''};
    },
    methods: {
        submit() {
            let dueDate = String(this.dueDate || '').trim();

            if (this.dueDate !== '') {
                const dueDateObj = new Date(this.dueDate);
                if (dueDateObj < new Date() && dueDateObj) {
                    this.error = 'Due date must be in the future.';
                    return;
                }
            } else {
                dueDate = "No due date";
            }

            this.$emit('create', {dueDate: dueDate || null});
            this.$emit('close');
        }
    },
    template: `
      <div class="fixed inset-0 bg-slate-900/60 p-4 flex items-start justify-center z-50">
        <div class="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
          <header class="px-4 py-3 border-b flex items-center justify-between">
            <h3 class="font-semibold">Edit a task due date</h3>
            <button class="px-2 py-1 border rounded-lg" @click="$emit('close')" aria-label="Close">✖️</button>
          </header>

          <form @submit.prevent="submit">
            <div class="p-4 space-y-3">
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