// R1: Task Creation Tests
// Covers requirements R1.1 - R1.6 and test cases TC01-TC04

window.TaskCreationTests = async function() {

    describe('R1: Task Creation', () => {
        let mockApp;

        beforeEach(() => {
            // Setup mock App instance
            mockApp = {
                tasks: [],
                methods: { ...App.methods },
                uid: App.methods.uid,
                saveTasks: vi.fn(),
                showForm: false
            };

            // Clear localStorage
            localStorage.removeItem('scu.todo.tasks.v1');

            // Globale Isolation - lösche ALLE Tasks zu Beginn
            mockApp.tasks = [];
        });

        afterEach(() => {
            // Cleanup nach jedem Test - lösche alle erstellten Tasks
            mockApp.tasks = [];
            localStorage.removeItem('scu.todo.tasks.v1');
        });

        // TC01: Create Task with Valid Data
        it('TC01: should create task with valid title and due date', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            const taskData = {
                title: 'Buy groceries',
                description: 'Milk, eggs, bread',
                dueDate: tomorrowStr
            };

            mockApp.methods.onCreate.call(mockApp, taskData);

            expect(mockApp.tasks.length).toBe(1);
            expect(mockApp.tasks[0].title).toBe('Buy groceries');
            expect(mockApp.tasks[0].description).toBe('Milk, eggs, bread');
            expect(mockApp.tasks[0].dueDate).toBe(tomorrowStr);
            expect(mockApp.showForm).toBe(false);

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        // TC02: Create Task Without Title
        it('TC02: should not create task without title', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const taskData = {
                title: '', // empty title
                description: 'Call mom',
                dueDate: '2025-12-31'
            };

            mockApp.methods.onCreate.call(mockApp, taskData);

            // Task should not be created due to empty title
            expect(mockApp.tasks.length).toBe(0);

            // Cleanup am Ende des Tests (bereits leer, aber zur Konsistenz)
            mockApp.tasks = [];
        });

        it('R1.4: should not create task with null/undefined title', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const taskData1 = {
                title: null,
                description: 'Test'
            };

            const taskData2 = {
                title: undefined,
                description: 'Test'
            };

            mockApp.methods.onCreate.call(mockApp, taskData1);
            mockApp.methods.onCreate.call(mockApp, taskData2);

            expect(mockApp.tasks.length).toBe(0);

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        // TC03: Create Task With Past Due Date
        it('TC03: should handle past due date (currently allows it)', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const taskData = {
                title: 'Finish homework',
                dueDate: yesterdayStr
            };

            mockApp.methods.onCreate.call(mockApp, taskData);

            // Note: Current implementation allows past dates
            // This test documents current behavior
            expect(mockApp.tasks.length).toBe(1);
            expect(mockApp.tasks[0].dueDate).toBe(yesterdayStr);

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        // TC04: Create Task Without Description or Due Date
        it('TC04: should create task without description or due date', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const taskData = {
                title: 'Read book'
                // no description or dueDate
            };

            mockApp.methods.onCreate.call(mockApp, taskData);

            expect(mockApp.tasks.length).toBe(1);
            expect(mockApp.tasks[0].title).toBe('Read book');
            expect(mockApp.tasks[0].description).toBe('');
            expect(mockApp.tasks[0].dueDate).toBe('No due date');

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        // R1.1: Task creation with title
        it('R1.1: should allow task creation with title', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const taskData = { title: 'Simple task' };

            mockApp.methods.onCreate.call(mockApp, taskData);

            expect(mockApp.tasks.length).toBe(1);
            expect(mockApp.tasks[0].title).toBe('Simple task');

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        // R1.2: Optional description
        it('R1.2: should allow optional description', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const taskData = {
                title: 'Task with description',
                description: 'This is a detailed description'
            };

            mockApp.methods.onCreate.call(mockApp, taskData);

            expect(mockApp.tasks[0].description).toBe('This is a detailed description');

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        // R1.3: Optional due date
        it('R1.3: should allow optional due date', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const taskData = {
                title: 'Task with due date',
                dueDate: '2025-12-25'
            };

            mockApp.methods.onCreate.call(mockApp, taskData);

            expect(mockApp.tasks[0].dueDate).toBe('2025-12-25');

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        // R1.6: No due date display
        it('R1.6: should display "No due date" when no date provided', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const taskData = { title: 'No date task' };

            mockApp.methods.onCreate.call(mockApp, taskData);

            expect(mockApp.tasks[0].dueDate).toBe('No due date');

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        it('should generate unique IDs for tasks', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const taskData1 = { title: 'Task 1' };
            const taskData2 = { title: 'Task 2' };

            mockApp.methods.onCreate.call(mockApp, taskData1);
            mockApp.methods.onCreate.call(mockApp, taskData2);

            expect(mockApp.tasks.length).toBe(2);
            expect(mockApp.tasks[0].id).toBeDefined();
            expect(mockApp.tasks[1].id).toBeDefined();
            expect(mockApp.tasks[0].id).not.toBe(mockApp.tasks[1].id);

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        it('should set default status and completion state', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const taskData = { title: 'New task' };

            mockApp.methods.onCreate.call(mockApp, taskData);

            expect(mockApp.tasks[0].completed).toBe(false);
            expect(mockApp.tasks[0].status).toBe('To Do');
            expect(mockApp.tasks[0].completedAt).toBe(null);

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });

        it('should set creation timestamp', () => {
            // Test-spezifische Isolation - sauberer Start
            mockApp.tasks = [];

            const beforeCreate = new Date().toISOString();
            const taskData = { title: 'Timestamped task' };

            mockApp.methods.onCreate.call(mockApp, taskData);

            const afterCreate = new Date().toISOString();
            const createdAt = mockApp.tasks[0].createdAt;

            expect(createdAt).toBeDefined();
            expect(createdAt >= beforeCreate).toBe(true);
            expect(createdAt <= afterCreate).toBe(true);

            // Cleanup am Ende des Tests
            mockApp.tasks = [];
        });
    });
};
