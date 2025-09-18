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
        <div class="flex justify-end mb-4">
            <button class="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
                    @click="openForm">New Task</button>
        </div>

        <p class="text-gray-500 text-center">Task creation coming.</p>

        <!-- Add TaskForm component here -->
        <task-form v-if="showForm" @close="showForm = false" @create="onCreate"></task-form>

      </main>
    </div>
  `,
    components: { 'task-form': TaskForm },
    data(){
      return {
        showForm: false,
        tasks: []   // in-memory for now
      };
        // TODO: Add your components here
        //'example': ExampleComponent
    },
    methods:{
      openForm(){ this.showForm = true; },
      onCreate(payload){
        const title = String(payload.title || '').trim();
        if (!title) return;
        const task = { id: Math.random().toString(36).slice(2), title };
        this.tasks = [task, ...this.tasks];
        this.showForm = false;
      }
    }
}
