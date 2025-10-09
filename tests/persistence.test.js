// R7: Data Persistence Tests
// Covers requirements R7.1 - R7.2 and test cases TC20-TC21

window.PersistenceTests = async function() {

    describe('R7: Data Persistence', () => {
        let mockApp;

        beforeEach(() => {
            // Create mockApp with direct method implementations
            mockApp = {
                tasks: [],
                saveTasks() {
                    localStorage.setItem('scu.todo.tasks.v1', JSON.stringify(this.tasks));
                },
                loadTasks() {
                    try {
                        const tasks = JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
                        return tasks.map(task => {
                            const t = {
                                completed: false,
                                completedAt: null,
                                status: 'To Do',
                                priority: 0,
                                ...task,
                                dueDate: typeof task.dueDate === 'undefined' ? 'No due date' : task.dueDate
                            };
                            if (!('status' in task)) t.status = t.completed ? 'Completed' : 'To Do';
                            if (typeof t.priority !== 'number') t.priority = 0;
                            return t;
                        });
                    } catch {
                        return [];
                    }
                },
                onEditTask(updatedTask) {
                    this.tasks = this.tasks.map(task => task.id === updatedTask.id ? { ...task, ...updatedTask } : task);
                    this.saveTasks();
                },
                deleteTask(taskId) {
                    this.tasks = this.tasks.filter(task => task.id !== taskId);
                    this.saveTasks();
                },
                toggleComplete(task) {
                    task.completed = !task.completed;
                    task.completedAt = task.completed ? new Date().toISOString() : null;
                    task.status = task.completed ? 'Completed' : (task.status === 'Completed' ? 'To Do' : task.status || 'To Do');
                    this.saveTasks();
                },
                chooseStatus(task, status) {
                    task.status = status;
                    if (status === 'Completed') {
                        if (!task.completed) task.completedAt = new Date().toISOString();
                        task.completed = true;
                    } else {
                        task.completed = false;
                        task.completedAt = null;
                    }
                    this.saveTasks();
                },
                setPriority(task, priority) {
                    task.priority = priority;
                    this.saveTasks();
                }
            };

            localStorage.removeItem('scu.todo.tasks.v1');
            mockApp.tasks = [];
        });

        afterEach(() => {
            mockApp.tasks = [];
            localStorage.removeItem('scu.todo.tasks.v1');
        });

        // TC20: Tasks Persist After Reload
        it('TC20: should persist tasks after page refresh', () => {
            mockApp.tasks = [];

            const testTasks = [
                {
                    id: 'persist-1',
                    title: 'Persistent Task 1',
                    description: 'This should persist',
                    completed: false,
                    status: 'To Do',
                    dueDate: '2025-12-31'
                },
                {
                    id: 'persist-2',
                    title: 'Persistent Task 2',
                    description: 'This should also persist',
                    completed: true,
                    status: 'Completed',
                    dueDate: 'No due date'
                }
            ];

            mockApp.tasks = testTasks;
            mockApp.saveTasks();

            // Simulate page reload by creating new app instance and loading tasks
            const newMockApp = {
                loadTasks() {
                    try {
                        const tasks = JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
                        return tasks.map(task => {
                            const t = {
                                completed: false,
                                completedAt: null,
                                status: 'To Do',
                                priority: 0,
                                ...task,
                                dueDate: typeof task.dueDate === 'undefined' ? 'No due date' : task.dueDate
                            };
                            if (!('status' in task)) t.status = t.completed ? 'Completed' : 'To Do';
                            if (typeof t.priority !== 'number') t.priority = 0;
                            return t;
                        });
                    } catch {
                        return [];
                    }
                }
            };

            const loadedTasks = newMockApp.loadTasks();

            expect(loadedTasks.length).toBe(2);
            expect(loadedTasks[0].id).toBe('persist-1');
            expect(loadedTasks[0].title).toBe('Persistent Task 1');
            expect(loadedTasks[1].id).toBe('persist-2');
            expect(loadedTasks[1].completed).toBe(true);

            mockApp.tasks = [];
        });

        // TC21: Changes Persist After Reload
        it('TC21: should persist edits, deletes, and completion changes after reload', () => {
            mockApp.tasks = [];

            // Initial tasks
            const initialTasks = [
                {
                    id: 'task-1',
                    title: 'Task to Edit',
                    description: 'Original',
                    completed: false,
                    status: 'To Do'
                },
                {
                    id: 'task-2',
                    title: 'Task to Delete',
                    completed: false,
                    status: 'To Do'
                },
                {
                    id: 'task-3',
                    title: 'Task to Complete',
                    completed: false,
                    status: 'To Do'
                }
            ];

            mockApp.tasks = [...initialTasks];
            mockApp.saveTasks();

            // Edit a task
            const editedTask = {
                id: 'task-1',
                title: 'Edited Task Title',
                description: 'Edited Description'
            };
            mockApp.onEditTask(editedTask);

            // Delete a task
            mockApp.deleteTask('task-2');

            // Complete a task
            const taskToComplete = mockApp.tasks.find(t => t.id === 'task-3');
            if (taskToComplete) {
                mockApp.toggleComplete(taskToComplete);
            }

            // Simulate page reload
            const newMockApp = {
                loadTasks() {
                    try {
                        const tasks = JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
                        return tasks.map(task => {
                            const t = {
                                completed: false,
                                completedAt: null,
                                status: 'To Do',
                                priority: 0,
                                ...task,
                                dueDate: typeof task.dueDate === 'undefined' ? 'No due date' : task.dueDate
                            };
                            if (!('status' in task)) t.status = t.completed ? 'Completed' : 'To Do';
                            if (typeof t.priority !== 'number') t.priority = 0;
                            return t;
                        });
                    } catch {
                        return [];
                    }
                }
            };

            const loadedTasks = newMockApp.loadTasks();

            expect(loadedTasks.length).toBe(2); // One deleted

            const editedLoadedTask = loadedTasks.find(t => t.id === 'task-1');
            expect(editedLoadedTask.title).toBe('Edited Task Title');
            expect(editedLoadedTask.description).toBe('Edited Description');

            const completedLoadedTask = loadedTasks.find(t => t.id === 'task-3');
            expect(completedLoadedTask.completed).toBe(true);
            expect(completedLoadedTask.status).toBe('Completed');

            const deletedTask = loadedTasks.find(t => t.id === 'task-2');
            expect(deletedTask).toBeUndefined();

            mockApp.tasks = [];
        });

        // R7.1: Persist tasks and statuses in localStorage
        it('R7.1: should persist tasks and their statuses in browser localStorage', () => {
            mockApp.tasks = [];

            const tasksWithStatuses = [
                {
                    id: 'status-1',
                    title: 'To Do Task',
                    completed: false,
                    status: 'To Do',
                    priority: 3
                },
                {
                    id: 'status-2',
                    title: 'In Progress Task',
                    completed: false,
                    status: 'In Progress',
                    priority: 5
                },
                {
                    id: 'status-3',
                    title: 'Completed Task',
                    completed: true,
                    status: 'Completed',
                    completedAt: '2025-01-01T00:00:00.000Z'
                }
            ];

            mockApp.tasks = tasksWithStatuses;
            mockApp.saveTasks();

            // Check localStorage directly
            const storedData = localStorage.getItem('scu.todo.tasks.v1');
            expect(storedData).toBeDefined();

            const parsedTasks = JSON.parse(storedData);
            expect(parsedTasks.length).toBe(3);
            expect(parsedTasks[0].status).toBe('To Do');
            expect(parsedTasks[1].status).toBe('In Progress');
            expect(parsedTasks[2].status).toBe('Completed');
            expect(parsedTasks[2].completed).toBe(true);

            mockApp.tasks = [];
        });

        // R7.2: Retain changes after page refresh or app reopening
        it('R7.2: should retain all changes after application reopening', () => {
            mockApp.tasks = [];

            const originalTask = {
                id: 'retain-test',
                title: 'Original Title',
                description: 'Original Description',
                completed: false,
                status: 'To Do',
                priority: 1,
                dueDate: '2025-12-31'
            };

            mockApp.tasks = [originalTask];
            mockApp.saveTasks();

            // Make multiple changes
            mockApp.onEditTask({
                id: 'retain-test',
                title: 'Updated Title',
                description: 'Updated Description',
                priority: 4
            });

            const task = mockApp.tasks[0];
            if (task) {
                mockApp.chooseStatus(task, 'In Progress');
            }

            // Simulate complete application restart
            const freshApp = {
                loadTasks() {
                    try {
                        const tasks = JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
                        return tasks.map(task => {
                            const t = {
                                completed: false,
                                completedAt: null,
                                status: 'To Do',
                                priority: 0,
                                ...task,
                                dueDate: typeof task.dueDate === 'undefined' ? 'No due date' : task.dueDate
                            };
                            if (!('status' in task)) t.status = t.completed ? 'Completed' : 'To Do';
                            if (typeof t.priority !== 'number') t.priority = 0;
                            return t;
                        });
                    } catch {
                        return [];
                    }
                }
            };

            const restoredTasks = freshApp.loadTasks();

            expect(restoredTasks.length).toBe(1);
            expect(restoredTasks[0].title).toBe('Updated Title');
            expect(restoredTasks[0].description).toBe('Updated Description');
            expect(restoredTasks[0].status).toBe('In Progress');
            expect(restoredTasks[0].priority).toBe(4);

            mockApp.tasks = [];
        });

        it('should handle empty localStorage gracefully', () => {
            mockApp.tasks = [];

            // Ensure localStorage is empty
            localStorage.removeItem('scu.todo.tasks.v1');

            const loadedTasks = mockApp.loadTasks();

            expect(loadedTasks).toEqual([]);

            mockApp.tasks = [];
        });

        it('should handle corrupted localStorage data gracefully', () => {
            mockApp.tasks = [];

            // Set invalid JSON in localStorage
            localStorage.setItem('scu.todo.tasks.v1', 'invalid json {');

            const loadedTasks = mockApp.loadTasks();

            expect(loadedTasks).toEqual([]);

            mockApp.tasks = [];
        });

        it('should normalize task properties when loading from storage', () => {
            mockApp.tasks = [];

            // Store task with minimal properties
            const minimalTask = {
                id: 'minimal',
                title: 'Minimal Task'
            };

            localStorage.setItem('scu.todo.tasks.v1', JSON.stringify([minimalTask]));

            const loadedTasks = mockApp.loadTasks();

            expect(loadedTasks[0].completed).toBe(false);
            expect(loadedTasks[0].completedAt).toBe(null);
            expect(loadedTasks[0].status).toBe('To Do'); // Fixed typo: was "To To"
            expect(loadedTasks[0].priority).toBe(0);
            expect(loadedTasks[0].dueDate).toBe('No due date');

            mockApp.tasks = [];
        });

        it('should maintain task order after persistence round-trip', () => {
            mockApp.tasks = [];

            const orderedTasks = [
                { id: 'first', title: 'First Task', createdAt: '2025-01-01T00:00:00.000Z' },
                { id: 'second', title: 'Second Task', createdAt: '2025-01-02T00:00:00.000Z' },
                { id: 'third', title: 'Third Task', createdAt: '2025-01-03T00:00:00.000Z' }
            ];

            mockApp.tasks = orderedTasks;
            mockApp.saveTasks();

            const loadedTasks = mockApp.loadTasks();

            expect(loadedTasks.length).toBe(3);
            expect(loadedTasks[0].id).toBe('first');
            expect(loadedTasks[1].id).toBe('second');
            expect(loadedTasks[2].id).toBe('third');

            mockApp.tasks = [];
        });

        it('should persist priority changes', () => {
            mockApp.tasks = [];

            const task = {
                id: 'priority-test',
                title: 'Priority Task',
                priority: 1
            };

            mockApp.tasks = [task];
            mockApp.saveTasks();

            // Change priority (setPriority already calls saveTasks)
            mockApp.setPriority(task, 5);

            // Load from storage
            const newMockApp = {
                loadTasks() {
                    try {
                        const tasks = JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
                        return tasks.map(task => {
                            const t = {
                                completed: false,
                                completedAt: null,
                                status: 'To Do',
                                priority: 0,
                                ...task,
                                dueDate: typeof task.dueDate === 'undefined' ? 'No due date' : task.dueDate
                            };
                            if (!('status' in task)) t.status = t.completed ? 'Completed' : 'To Do';
                            if (typeof t.priority !== 'number') t.priority = 0;
                            return t;
                        });
                    } catch {
                        return [];
                    }
                }
            };
            const loadedTasks = newMockApp.loadTasks();

            expect(loadedTasks[0].priority).toBe(5);

            mockApp.tasks = [];
        });

        it('should persist due date changes', () => {
            mockApp.tasks = [];

            const task = {
                id: 'duedate-test',
                title: 'Due Date Task',
                dueDate: '2025-12-31'
            };

            mockApp.tasks = [task];
            mockApp.saveTasks();

            // Change due date (onEditTask already calls saveTasks internally)
            mockApp.onEditTask({
                id: 'duedate-test',
                dueDate: '2026-06-15'
            });

            // Load from storage
            const newMockApp = {
                loadTasks() {
                    try {
                        const tasks = JSON.parse(localStorage.getItem('scu.todo.tasks.v1') || '[]');
                        return tasks.map(task => {
                            const t = {
                                completed: false,
                                completedAt: null,
                                status: 'To Do',
                                priority: 0,
                                ...task,
                                dueDate: typeof task.dueDate === 'undefined' ? 'No due date' : task.dueDate
                            };
                            if (!('status' in task)) t.status = t.completed ? 'Completed' : 'To Do';
                            if (typeof t.priority !== 'number') t.priority = 0;
                            return t;
                        });
                    } catch {
                        return [];
                    }
                }
            };
            const loadedTasks = newMockApp.loadTasks();

            expect(loadedTasks[0].dueDate).toBe('2026-06-15');

            mockApp.tasks = [];
        });

        it('should use correct localStorage key', () => {
            mockApp.tasks = [];

            mockApp.tasks = [{ id: 'key-test', title: 'Test Key' }];
            mockApp.saveTasks();

            const storedValue = localStorage.getItem('scu.todo.tasks.v1');
            expect(storedValue).toBeDefined();
            expect(JSON.parse(storedValue)).toEqual(mockApp.tasks);

            mockApp.tasks = [];
        });
    });
};
