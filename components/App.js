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

        <!-- TODO: Add here the components -->
        <!-- <example></example> -->

      </main>
    </div>
  `,
    components: {
        // TODO: Add your components here
        //'example': ExampleComponent
    },
    methods:{
      openForm(){ alert('Task creation modal will be added in Stage 2.'); }
    }
}
