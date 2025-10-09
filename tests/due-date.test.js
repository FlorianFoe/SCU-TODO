// R5: Due Date Handling Tests
// Covers requirements R5.1 - R5.3 and test cases TC13-TC15

window.DueDateTests = async function() {

    describe('R5: Due Date Handling', () => {
        let mockApp;
        let testTasks;

        beforeEach(() => {
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            testTasks = [
                {
                    id: 'task-overdue',
                    title: 'Overdue Task',
                    completed: false,
                    dueDate: yesterday.toISOString().split('T')[0]
                },
                {
                    id: 'task-no-date',
                    title: 'No Due Date Task',
                    completed: false,
                    dueDate: 'No due date'
                },
                {
                    id: 'task-future',
                    title: 'Future Task',
                    completed: false,
                    dueDate: tomorrow.toISOString().split('T')[0]
                },
                {
                    id: 'task-completed-overdue',
                    title: 'Completed Overdue Task',
                    completed: true,
                    dueDate: yesterday.toISOString().split('T')[0]
                }
            ];

            mockApp = {
                tasks: [],
                methods: { ...App.methods },
                computed: { ...App.computed },
                saveTasks: vi.fn()
            };

            localStorage.removeItem('scu.todo.tasks.v1');
            mockApp.tasks = [];
        });

        afterEach(() => {
            mockApp.tasks = [];
            localStorage.removeItem('scu.todo.tasks.v1');
        });

        // TC13: Overdue Task Count
        it('TC13: should count overdue tasks correctly', () => {
            mockApp.tasks = [...testTasks];

            const overdueCount = mockApp.computed.overdueCount.call(mockApp);

            // Only one task should be overdue (task-overdue)
            // task-completed-overdue is completed, so not counted
            // task-no-date has no due date, so not counted
            // task-future is in the future, so not counted
            expect(overdueCount).toBe(1);

            mockApp.tasks = [];
        });

        // TC14: No Due Date Not Overdue
        it('TC14: should not mark tasks without due date as overdue', () => {
            // Create app with only tasks without due dates
            mockApp.tasks = [
                {
                    id: 'task-1',
                    title: 'Task 1',
                    completed: false,
                    dueDate: 'No due date'
                },
                {
                    id: 'task-2',
                    title: 'Task 2',
                    completed: false,
                    dueDate: null
                },
                {
                    id: 'task-3',
                    title: 'Task 3',
                    completed: false,
                    dueDate: undefined
                }
            ];

            const overdueCount = mockApp.computed.overdueCount.call(mockApp);
            expect(overdueCount).toBe(0);

            mockApp.tasks = [];
        });

        // TC15: Overdue Count Updates
        it('TC15: should update overdue count when due dates change', () => {
            mockApp.tasks = [...testTasks];

            const initialOverdueCount = mockApp.computed.overdueCount.call(mockApp);
            expect(initialOverdueCount).toBe(1);

            // Edit overdue task to have future due date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            const updatedTask = {
                id: 'task-overdue',
                title: 'No Longer Overdue Task',
                dueDate: tomorrowStr
            };

            mockApp.methods.onEditTask.call(mockApp, updatedTask);

            const newOverdueCount = mockApp.computed.overdueCount.call(mockApp);
            expect(newOverdueCount).toBe(0);

            mockApp.tasks = [];
        });

        // R5.1: Determine overdue based on due date and current date
        it('R5.1: should determine overdue status based on current date', () => {
            const now = new Date();

            // Test with various dates
            const testCases = [
                {
                    dueDate: new Date(now.getTime() - 86400000).toISOString().split('T')[0], // yesterday
                    shouldBeOverdue: true
                },
                {
                    dueDate: now.toISOString().split('T')[0], // today
                    shouldBeOverdue: false
                },
                {
                    dueDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0], // tomorrow
                    shouldBeOverdue: false
                }
            ];

            testCases.forEach((testCase, index) => {
                mockApp.tasks = [{
                    id: `test-${index}`,
                    title: `Test Task ${index}`,
                    completed: false,
                    dueDate: testCase.dueDate
                }];

                const overdueCount = mockApp.computed.overdueCount.call(mockApp);
                expect(overdueCount).toBe(testCase.shouldBeOverdue ? 1 : 0);
            });

            mockApp.tasks = [];
        });

        // R5.2: Tasks with no due date not considered overdue
        it('R5.2: should not consider tasks with no due date as overdue', () => {
            mockApp.tasks = [
                {
                    id: 'task-1',
                    title: 'No Date Task',
                    completed: false,
                    dueDate: 'No due date'
                }
            ];

            const overdueCount = mockApp.computed.overdueCount.call(mockApp);
            expect(overdueCount).toBe(0);

            mockApp.tasks = [];
        });

        // R5.3: Overdue count updates when dates are modified
        it('R5.3: should update overdue count when due dates are added, edited, or removed', () => {
            // Start with no overdue tasks
            mockApp.tasks = [{
                id: 'task-1',
                title: 'Future Task',
                completed: false,
                dueDate: '2026-12-31'
            }];

            expect(mockApp.computed.overdueCount.call(mockApp)).toBe(0);

            // Add overdue date
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            mockApp.methods.onEditTask.call(mockApp, {
                id: 'task-1',
                dueDate: yesterdayStr
            });

            expect(mockApp.computed.overdueCount.call(mockApp)).toBe(1);

            // Remove due date
            mockApp.methods.onEditTask.call(mockApp, {
                id: 'task-1',
                dueDate: 'No due date'
            });

            expect(mockApp.computed.overdueCount.call(mockApp)).toBe(0);

            mockApp.tasks = [];
        });

        it('should not count completed tasks as overdue even with past due dates', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            mockApp.tasks = [
                {
                    id: 'completed-overdue',
                    title: 'Completed Overdue Task',
                    completed: true,
                    dueDate: yesterday.toISOString().split('T')[0]
                }
            ];

            const overdueCount = mockApp.computed.overdueCount.call(mockApp);
            expect(overdueCount).toBe(0);

            mockApp.tasks = [];
        });

        it('should handle invalid date formats gracefully', () => {
            mockApp.tasks = [
                {
                    id: 'invalid-date',
                    title: 'Invalid Date Task',
                    completed: false,
                    dueDate: 'invalid-date-string'
                }
            ];

            expect(() => {
                const overdueCount = mockApp.computed.overdueCount.call(mockApp);
                expect(overdueCount).toBe(0);
            }).not.toThrow();

            mockApp.tasks = [];
        });

        it('should handle edge case of exactly today as due date', () => {
            const today = new Date().toISOString().split('T')[0];

            mockApp.tasks = [{
                id: 'due-today',
                title: 'Due Today Task',
                completed: false,
                dueDate: today
            }];

            const overdueCount = mockApp.computed.overdueCount.call(mockApp);
            // Tasks due today should not be considered overdue
            expect(overdueCount).toBe(0);

            mockApp.tasks = [];
        });

        it('should update overdue count when task completion status changes', () => {
            // Start with overdue incomplete task
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const task = {
                id: 'overdue-task',
                title: 'Overdue Task',
                completed: false,
                status: 'To Do',
                dueDate: yesterday.toISOString().split('T')[0]
            };

            mockApp.tasks = [task];
            mockApp.saveTasks = vi.fn(); // Fresh mock for this test

            expect(mockApp.computed.overdueCount.call(mockApp)).toBe(1);

            // Complete the task
            mockApp.methods.toggleComplete.call(mockApp, task);
            expect(mockApp.computed.overdueCount.call(mockApp)).toBe(0);

            // Mark as incomplete again
            mockApp.methods.toggleComplete.call(mockApp, task);
            expect(mockApp.computed.overdueCount.call(mockApp)).toBe(1);

            mockApp.tasks = [];
        });
    });
};
