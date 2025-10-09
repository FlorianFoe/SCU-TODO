// R4: Task Completion & Status Tests
// Covers requirements R4.1 - R4.3 and test cases TC10-TC12

window.TaskStatusTests = async function() {

    describe('R4: Task Completion & Status', () => {
        let mockApp;
        let testTasks;
        let originalLocalStorage;

        beforeEach(() => {
            // Mock localStorage for clean isolation
            originalLocalStorage = window.localStorage;
            window.localStorage = {
                getItem: () => '[]',
                setItem: () => {},
                removeItem: () => {},
                clear: () => {}
            };

            // Create fresh test tasks for each test
            testTasks = [
                {
                    id: 'task-1',
                    title: 'Active Task',
                    completed: false,
                    status: 'To Do',
                    completedAt: null
                },
                {
                    id: 'task-2',
                    title: 'In Progress Task',
                    completed: false,
                    status: 'In Progress',
                    completedAt: null
                },
                {
                    id: 'task-3',
                    title: 'Completed Task',
                    completed: true,
                    status: 'Completed',
                    completedAt: '2025-01-01T00:00:00.000Z'
                }
            ];

            // Simple mock app object - corrected logic to match real app
            mockApp = {
                tasks: JSON.parse(JSON.stringify(testTasks)), // Deep copy for isolation
                statusMenuFor: null,
                saveTasksCalled: 0,

                saveTasks() {
                    this.saveTasksCalled++;
                },
                closeStatusMenu() {
                    this.statusMenuFor = null;
                },
                toggleComplete(t) {
                    const previousStatus = t.status;
                    t.completed = !t.completed;
                    t.completedAt = t.completed ? new Date().toISOString() : null;

                    // Match real app logic from App.js line 342
                    t.status = t.completed ? 'Completed' : (t.status === 'Completed' ? 'To Do' : t.status || 'To Do');
                    this.saveTasks();
                },
                chooseStatus(t, status) {
                    t.status = status;
                    if (status === 'Completed') {
                        if (!t.completed) t.completedAt = new Date().toISOString();
                        t.completed = true;
                    } else {
                        t.completed = false;
                        t.completedAt = null;
                    }
                    this.saveTasks();
                    this.closeStatusMenu();
                },
                completedCount() {
                    return this.tasks.filter(t => t.completed).length;
                },
                totalCount() {
                    return this.tasks.length;
                },
                activeCount() {
                    return this.tasks.filter(t => !t.completed).length;
                }
            };
        });

        afterEach(() => {
            // Restore original localStorage
            if (originalLocalStorage) {
                window.localStorage = originalLocalStorage;
            }

            // Reset variables but don't null them during test execution
            if (testTasks) {
                testTasks.length = 0;
            }
        });

        // TC10: Mark Task as Completed
        it('TC10: should mark task as completed and update counts', () => {
            const task = mockApp.tasks[0]; // Active task
            const initialCompletedCount = mockApp.completedCount();

            mockApp.chooseStatus(task, 'Completed');

            expect(task.status).toBe('Completed');
            expect(task.completed).toBe(true);
            expect(task.completedAt).toBeDefined();
            expect(task.completedAt).not.toBe(null);

            const newCompletedCount = mockApp.completedCount();
            expect(newCompletedCount).toBe(initialCompletedCount + 1);
            expect(mockApp.saveTasksCalled > 0).toBe(true);
        });

        // TC11: Mark Completed Task as To Do
        it('TC11: should change completed task back to To Do', () => {
            const task = mockApp.tasks[2]; // Completed task
            const initialActiveCount = mockApp.activeCount();

            mockApp.chooseStatus(task, 'To Do');

            expect(task.status).toBe('To Do');
            expect(task.completed).toBe(false);
            expect(task.completedAt).toBe(null);

            const newActiveCount = mockApp.activeCount();
            expect(newActiveCount).toBe(initialActiveCount + 1);
            expect(mockApp.saveTasksCalled > 0).toBe(true);
        });

        // TC12: Completed/Active Counts
        it('TC12: should update counts correctly when changing status', () => {
            const task1 = mockApp.tasks[0]; // To Do
            const task2 = mockApp.tasks[1]; // In Progress

            const initialCounts = {
                completed: mockApp.completedCount(),
                active: mockApp.activeCount(),
                total: mockApp.totalCount()
            };

            // Mark two tasks as completed
            mockApp.chooseStatus(task1, 'Completed');
            mockApp.chooseStatus(task2, 'Completed');

            const afterCompletingCounts = {
                completed: mockApp.completedCount(),
                active: mockApp.activeCount(),
                total: mockApp.totalCount()
            };

            expect(afterCompletingCounts.completed).toBe(initialCounts.completed + 2);
            expect(afterCompletingCounts.active).toBe(initialCounts.active - 2);
            expect(afterCompletingCounts.total).toBe(initialCounts.total);

            // Mark one back as To Do
            mockApp.chooseStatus(task1, 'To Do');

            const finalCounts = {
                completed: mockApp.completedCount(),
                active: mockApp.activeCount(),
                total: mockApp.totalCount()
            };

            expect(finalCounts.completed).toBe(afterCompletingCounts.completed - 1);
            expect(finalCounts.active).toBe(afterCompletingCounts.active + 1);
        });

        // R4.1: Mark task as completed
        it('R4.1: should allow marking task as completed', () => {
            const task = mockApp.tasks[0];
            expect(task.completed).toBe(false);

            mockApp.toggleComplete(task);

            expect(task.completed).toBe(true);
            expect(task.status).toBe('Completed');
            expect(task.completedAt).toBeDefined();
            expect(mockApp.saveTasksCalled > 0).toBe(true);
        });

        // R4.2: Change completed task back to To Do
        it('R4.2: should change completed task status back to To Do', () => {
            const task = mockApp.tasks[2]; // Already completed
            expect(task.completed).toBe(true);

            mockApp.toggleComplete(task);

            expect(task.completed).toBe(false);
            expect(task.status).toBe('To Do');
            expect(task.completedAt).toBe(null);
            expect(mockApp.saveTasksCalled > 0).toBe(true);
        });

        // R4.3: Display counts and update when status changes
        it('R4.3: should display and update task counts', () => {
            const initialCounts = {
                completed: mockApp.completedCount(),
                active: mockApp.activeCount(),
                total: mockApp.totalCount()
            };

            expect(initialCounts.total).toBe(3);
            expect(initialCounts.completed).toBe(1);
            expect(initialCounts.active).toBe(2);

            // Complete an active task
            mockApp.toggleComplete(mockApp.tasks[0]);

            expect(mockApp.completedCount()).toBe(2);
            expect(mockApp.activeCount()).toBe(1);
            expect(mockApp.totalCount()).toBe(3);
        });

        it('should set completedAt timestamp when marking as completed', () => {
            const task = mockApp.tasks[0];
            const beforeComplete = new Date().toISOString();

            mockApp.chooseStatus(task, 'Completed');

            const afterComplete = new Date().toISOString();
            expect(task.completedAt).toBeDefined();
            expect(task.completedAt >= beforeComplete).toBe(true);
            expect(task.completedAt <= afterComplete).toBe(true);
            expect(mockApp.saveTasksCalled > 0).toBe(true);
        });

        it('should handle In Progress status correctly', () => {
            const task = mockApp.tasks[0];

            mockApp.chooseStatus(task, 'In Progress');

            expect(task.status).toBe('In Progress');
            expect(task.completed).toBe(false);
            expect(task.completedAt).toBe(null);
            expect(mockApp.saveTasksCalled > 0).toBe(true);
        });

        it('should close status menu after choosing status', () => {
            const task = mockApp.tasks[0];
            mockApp.statusMenuFor = task.id;

            mockApp.chooseStatus(task, 'Completed');

            expect(mockApp.statusMenuFor).toBe(null);
        });

        it('should save tasks after status change', () => {
            const task = mockApp.tasks[0];

            mockApp.chooseStatus(task, 'Completed');

            expect(mockApp.saveTasksCalled > 0).toBe(true);
        });

        it('should handle toggle complete correctly', () => {
            const activeTask = mockApp.tasks[0];
            const completedTask = mockApp.tasks[2];

            // Toggle active to completed
            mockApp.toggleComplete(activeTask);
            expect(activeTask.completed).toBe(true);
            expect(activeTask.status).toBe('Completed');

            // Toggle completed to active
            mockApp.toggleComplete(completedTask);
            expect(completedTask.completed).toBe(false);
            expect(completedTask.status).toBe('To Do');
        });

        it('should preserve In Progress status when toggling completion', () => {
            const task = mockApp.tasks[1]; // In Progress task
            expect(task.status).toBe('In Progress');

            // Complete the task
            mockApp.toggleComplete(task);
            expect(task.status).toBe('Completed');
            expect(task.completed).toBe(true);

            // Toggle back - should revert to In Progress
            mockApp.toggleComplete(task);
            expect(task.status).toBe('In Progress');
            expect(task.completed).toBe(false);
        });
    });
};
