// TaskList component: nested inside Home page
const TaskList = {
    data() {
        return {
            tasks: [
                { id: 1, text: 'Learn Vue basics', done: false },
                { id: 2, text: 'Add Vue Router', done: true }
            ]
        };
    },
    template: `
    <div class="bg-white rounded-xl shadow-md p-4">
      <h2 class="text-xl font-semibold mb-2">Task List</h2>
      <ul>
        <!-- Loop through tasks and display each one -->
        <li v-for="task in tasks" :key="task.id" class="mb-1">
          <input type="checkbox" v-model="task.done" class="mr-2">
          <span :class="{'line-through text-gray-400': task.done}">
            {{ task.text }}
          </span>
        </li>
      </ul>
    </div>
  `
};
