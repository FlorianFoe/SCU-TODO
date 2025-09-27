const ImportForm = {
    emits: ['close', 'import'],
    data() {
        return {tasksFile: '', error: ''};
    },
    methods: {
        onFileChange(event) {
            const file = event.target.files[0];
            this.tasksFile = file;
            this.error = '';
        },
        submit() {
            let tasksFile = this.tasksFile;
            if (!tasksFile) {
                this.error = 'Please select a file to import.';
                return;
            } else if (tasksFile.type !== 'application/json') {
                this.error = 'Only JSON files are supported.';
                return;
            }
            this.$emit('import', {tasksFile: tasksFile || null});
            this.$emit('close');
        }
    },
    template: `
      <div class="fixed inset-0 bg-slate-900/60 p-4 flex items-start justify-center z-50">
        <div class="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
          <header class="px-4 py-3 border-b flex items-center justify-between">
            <h3 class="font-semibold">Import tasks</h3>
            <button class="px-2 py-1 border rounded-lg" @click="$emit('close')" aria-label="Close">✖️</button>
          </header>

          <form @submit.prevent="submit">
            <div class="p-4 space-y-3">
              <div>
                <label class="text-sm text-slate-600">Tasks File for Import (.json)</label>
                <input v-on:change="onFileChange" type="file" class="w-full border rounded-lg px-3 py-2">
              </div>
              
              <p v-if="error" class="text-rose-700 text-sm">{{ error }}</p>
            </div>

            <footer class="px-4 py-3 border-t flex justify-end gap-2">
              <button type="button" class="px-3 py-2 border rounded-lg" @click="$emit('close')">Cancel</button>
              <button type="submit" class="px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Import</button>
            </footer>
          </form>
        </div>
      </div>
    `
};