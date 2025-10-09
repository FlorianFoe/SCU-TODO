// R2: Task Editing Tests
// Covers requirements R2.1 - R2.4 and test cases TC05-TC07

window.TaskEditingTests = async function() {

    describe('R2: Task Editing', () => {
        let mockApp;
        let existingTask;

        beforeEach(() => {
            // Setup existing task template
            existingTask = {
                id: 'test-task-1',
                title: 'Original Title',
                description: 'Original Description',
                dueDate: '2025-12-31',
                completed: false,
                status: 'To Do',
                priority: 1,
                createdAt: '2025-01-01T00:00:00.000Z'
            };

            mockApp = {
                tasks: [],
                methods: { ...App.methods },
                saveTasks: vi.fn(),
                showEditForm: false,
                editingTask: null
            };

            localStorage.removeItem('scu.todo.tasks.v1');
        });

        // TC05: Edit Task Title, Description, Due Date
        it('TC05: should update task with new title, description and due date', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            const updatedTask = {
                id: 'test-task-1',
                title: 'Buy groceries and snacks',
                description: 'Milk, eggs, bread, chips',
                dueDate: '2025-12-27', // two days from now (relative to test date)
                completed: false,
                status: 'To Do'
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            expect(mockApp.tasks[0].title).toBe('Buy groceries and snacks');
            expect(mockApp.tasks[0].description).toBe('Milk, eggs, bread, chips');
            expect(mockApp.tasks[0].dueDate).toBe('2025-12-27');
            expect(mockApp.showEditForm).toBe(false);
            expect(mockApp.editingTask).toBe(null);
        });

        // TC06: Edit Task With Empty Title
        it('TC06: should handle empty title in edit (implementation dependent)', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            const updatedTask = {
                id: 'test-task-1',
                title: '', // empty title
                description: 'Updated description'
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            // Current implementation allows empty title in edit
            // This documents the current behavior
            expect(mockApp.tasks[0].title).toBe('');
        });

        // TC07: Edit Due Date to Past Date
        it('TC07: should handle past due date in edit (implementation dependent)', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const updatedTask = {
                id: 'test-task-1',
                title: 'Updated task',
                dueDate: yesterdayStr
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            // Current implementation allows past dates in edit
            expect(mockApp.tasks[0].dueDate).toBe(yesterdayStr);
        });

        // R2.1: Edit title, description, and due date
        it('R2.1: should allow editing title, description, and due date', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            const updatedTask = {
                id: 'test-task-1',
                title: 'New Title',
                description: 'New Description',
                dueDate: '2026-01-01'
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            const task = mockApp.tasks[0];
            expect(task.title).toBe('New Title');
            expect(task.description).toBe('New Description');
            expect(task.dueDate).toBe('2026-01-01');
        });

        // R2.4: Changes reflected immediately
        it('R2.4: should reflect changes in task list immediately', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            const originalTitle = mockApp.tasks[0].title;
            const updatedTask = {
                id: 'test-task-1',
                title: 'Immediately Updated Title'
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            expect(mockApp.tasks[0].title).toBe('Immediately Updated Title');
            expect(mockApp.tasks[0].title).not.toBe(originalTitle);
            expect(mockApp.saveTasks).toHaveBeenCalled();
        });

        it('should preserve other task properties during edit', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            const updatedTask = {
                id: 'test-task-1',
                title: 'Only Title Changed'
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            const task = mockApp.tasks[0];
            expect(task.title).toBe('Only Title Changed');
            expect(task.description).toBe('Original Description'); // preserved
            expect(task.dueDate).toBe('2025-12-31'); // preserved
            expect(task.completed).toBe(false); // preserved
            expect(task.createdAt).toBe('2025-01-01T00:00:00.000Z'); // preserved
        });

        it('should handle editing non-existent task gracefully', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            const updatedTask = {
                id: 'non-existent-task',
                title: 'This should not create a new task'
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            expect(mockApp.tasks.length).toBe(1);
            expect(mockApp.tasks[0].id).toBe('test-task-1');
        });

        it('should update multiple properties at once', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            const updatedTask = {
                id: 'test-task-1',
                title: 'Multi-Update Title',
                description: 'Multi-Update Description',
                dueDate: '2026-06-15',
                priority: 5,
                status: 'In Progress'
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            const task = mockApp.tasks[0];
            expect(task.title).toBe('Multi-Update Title');
            expect(task.description).toBe('Multi-Update Description');
            expect(task.dueDate).toBe('2026-06-15');
            expect(task.priority).toBe(5);
            expect(task.status).toBe('In Progress');
        });

        it('should close edit form and clear editing task after successful edit', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            mockApp.showEditForm = true;
            mockApp.editingTask = { ...existingTask };

            const updatedTask = {
                id: 'test-task-1',
                title: 'Updated Title'
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            expect(mockApp.showEditForm).toBe(false);
            expect(mockApp.editingTask).toBe(null);
        });

        it('should handle partial updates correctly', () => {
            // Explizite Isolation - erstelle Test-Task
            mockApp.tasks = [{ ...existingTask }];

            const updatedTask = {
                id: 'test-task-1',
                description: 'Only description updated'
                // title and other properties not provided
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            const task = mockApp.tasks[0];
            expect(task.description).toBe('Only description updated');
            expect(task.title).toBe('Original Title'); // should remain unchanged
        });
    });
};
