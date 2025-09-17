// Home page component with nested TaskList component
const Home = {
    template: `
    <div>
      <h1 class="text-2xl font-bold mb-4">Home Page</h1>
      <!-- Task list nested inside Home -->
      <task-list></task-list>
    </div>
  `,
    components: {
        'task-list': TaskList
    }
};
