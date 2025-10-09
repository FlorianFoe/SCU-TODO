// R3: Task Deletion Tests
// Covers requirements R3.1 - R3.3 and test cases TC08-TC09

window.TaskDeletionTests = async function() {

    describe('R3: Task Deletion', () => {
        let mockApp;
        let testTasks;

        beforeEach(() => {
            // Setup test task templates
            testTasks = [
                {
                    id: 'task-1',
                    title: 'Task to delete',
                    description: 'This task will be deleted',
                    completed: false,
                    status: 'To Do'
                },
                {
                    id: 'task-2',
                    title: 'Task to keep',
                    description: 'This task should remain',
                    completed: true,
                    status: 'Completed'
                }
            ];

            mockApp = {
                tasks: [],
                methods: { ...App.methods },
                saveTasks: vi.fn()
            };

            localStorage.removeItem('scu.todo.tasks.v1');
            mockApp.tasks = [];
        });

        afterEach(() => {
            mockApp.tasks = [];
            localStorage.removeItem('scu.todo.tasks.v1');
        });

        // TC08: Delete Task
        it('TC08: should delete task from list and storage', () => {
            mockApp.tasks = [...testTasks];

            const initialCount = mockApp.tasks.length;
            const taskToDeleteId = 'task-1';

            mockApp.methods.deleteTask.call(mockApp, taskToDeleteId);

            expect(mockApp.tasks.length).toBe(initialCount - 1);
            expect(mockApp.tasks.find(t => t.id === taskToDeleteId)).toBeUndefined();
            expect(mockApp.tasks.find(t => t.id === 'task-2')).toBeDefined();
            expect(mockApp.saveTasks).toHaveBeenCalled();

            mockApp.tasks = [];
        });

        // TC09: Delete Non-existent Task
        it('TC09: should handle deleting non-existent task without error', () => {
            mockApp.tasks = [...testTasks];

            const initialCount = mockApp.tasks.length;
            const nonExistentTaskId = 'non-existent-task-id';

            // Should not throw an error
            expect(() => {
                mockApp.methods.deleteTask.call(mockApp, nonExistentTaskId);
            }).not.toThrow();

            // Task count should remain the same
            expect(mockApp.tasks.length).toBe(initialCount);
            expect(mockApp.saveTasks).toHaveBeenCalled();

            mockApp.tasks = [];
        });

        // R3.1: Allow user to delete a task
        it('R3.1: should allow user to delete a task', () => {
            mockApp.tasks = [...testTasks];

            const taskId = 'task-2';
            const taskExists = mockApp.tasks.some(t => t.id === taskId);

            expect(taskExists).toBe(true);

            mockApp.methods.deleteTask.call(mockApp, taskId);

            const taskStillExists = mockApp.tasks.some(t => t.id === taskId);
            expect(taskStillExists).toBe(false);

            mockApp.tasks = [];
        });

        // R3.2: Remove from UI and persistent storage
        it('R3.2: should remove task from both UI and storage', () => {
            mockApp.tasks = [...testTasks];

            const taskId = 'task-1';

            mockApp.methods.deleteTask.call(mockApp, taskId);

            // Removed from UI (tasks array)
            expect(mockApp.tasks.find(t => t.id === taskId)).toBeUndefined();

            // Storage save called (persistent storage)
            expect(mockApp.saveTasks).toHaveBeenCalled();

            mockApp.tasks = [];
        });

        // R3.3: No error when deleting non-existent task
        it('R3.3: should not crash when deleting non-existent task', () => {
            mockApp.tasks = [...testTasks];

            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                mockApp.methods.deleteTask.call(mockApp, 'invalid-id-1');
                mockApp.methods.deleteTask.call(mockApp, 'invalid-id-2');
                mockApp.methods.deleteTask.call(mockApp, null);
                mockApp.methods.deleteTask.call(mockApp, undefined);
            }).not.toThrow();

            // Verify no console errors were logged
            expect(consoleError).not.toHaveBeenCalled();

            consoleError.mockRestore();

            mockApp.tasks = [];
        });

        it('should delete completed tasks', () => {
            mockApp.tasks = [...testTasks];

            const completedTaskId = 'task-2';
            expect(mockApp.tasks.find(t => t.id === completedTaskId).completed).toBe(true);

            mockApp.methods.deleteTask.call(mockApp, completedTaskId);

            expect(mockApp.tasks.find(t => t.id === completedTaskId)).toBeUndefined();

            mockApp.tasks = [];
        });

        it('should delete active tasks', () => {
            mockApp.tasks = [...testTasks];

            const activeTaskId = 'task-1';
            expect(mockApp.tasks.find(t => t.id === activeTaskId).completed).toBe(false);

            mockApp.methods.deleteTask.call(mockApp, activeTaskId);

            expect(mockApp.tasks.find(t => t.id === activeTaskId)).toBeUndefined();

            mockApp.tasks = [];
        });

        it('should handle deleting all tasks', () => {
            mockApp.tasks = [...testTasks];
            mockApp.saveTasks = vi.fn(); // Fresh mock for this test only

            mockApp.methods.deleteTask.call(mockApp, 'task-1');
            mockApp.methods.deleteTask.call(mockApp, 'task-2');

            expect(mockApp.tasks.length).toBe(0);
            expect(mockApp.saveTasks).toHaveBeenCalledTimes(2);

            mockApp.tasks = [];
        });

        it('should preserve order of remaining tasks after deletion', () => {
            mockApp.tasks = [...testTasks];

            // Add a third task
            mockApp.tasks.push({
                id: 'task-3',
                title: 'Third task',
                completed: false
            });

            // Delete middle task
            mockApp.methods.deleteTask.call(mockApp, 'task-2');

            expect(mockApp.tasks.length).toBe(2);
            expect(mockApp.tasks[0].id).toBe('task-1');
            expect(mockApp.tasks[1].id).toBe('task-3');

            mockApp.tasks = [];
        });

        it('should handle deletion with empty string ID', () => {
            mockApp.tasks = [...testTasks];

            expect(() => {
                mockApp.methods.deleteTask.call(mockApp, '');
            }).not.toThrow();

            expect(mockApp.tasks.length).toBe(2); // No tasks should be deleted

            mockApp.tasks = [];
        });
    });
};
