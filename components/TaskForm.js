  const TaskForm = {
    emits: ['close','create'],
    data(){
      return { title: '', description: '', error: '' };
    },
    methods:{
      submit(){
        const title = String(this.title || '').trim();
        if (!title) { this.error = 'Title is required.'; return; }
        this.$emit('create', {
          title,
          description: String(this.description || '').trim()
        });
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
            <div class="p-4 space-y-4">
              <div>
                <label for="fTitle" class="text-sm text-slate-600">Title</label>
                <input id="fTitle" v-model="title" type="text" required
                       class="w-full border rounded-lg px-3 py-2" placeholder="What needs to be done?">
              </div>

              <div>
                <label for="fDesc" class="text-sm text-slate-600">Description</label>
                <textarea id="fDesc" v-model="description" rows="4"
                          class="w-full border rounded-lg px-3 py-2" placeholder="Optional details..."></textarea>
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