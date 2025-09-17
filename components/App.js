// Root component that defines layout and navigation
const App = {
    template: `
    <div>
      <!-- Navigation bar -->
      <nav class="bg-blue-600 text-white p-4 flex justify-around">
        <router-link to="/" class="hover:underline">Home</router-link>
        <router-link to="/about" class="hover:underline">About</router-link>
      </nav>
      
      <!-- Main content will be rendered here by Vue Router -->
      <main class="p-4">
        <router-view></router-view>
      </main>
    </div>
  `
};
