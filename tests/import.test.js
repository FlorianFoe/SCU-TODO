// R6: Import Tasks Tests
// Covers requirements R6.1 - R6.4 and test cases TC16-TC19

window.ImportTests = async function() {

    describe('R6: Import Tasks', () => {
        let mockApp;

        beforeEach(() => {
            mockApp = {
                tasks: [],
                methods: { ...App.methods },
                uid: App.methods.uid,
                saveTasks: vi.fn(),
                showImportConfirm: false,
                importedTasksPreview: []
            };

            // Mock alert to avoid browser popups
            window.alert = vi.fn();

            localStorage.removeItem('scu.todo.tasks.v1');
        });

        // Helper function to create a mock Blob
        function createMockBlob(content, type = 'application/json') {
            return new Blob([content], { type: type });
        }

        // TC16: Import Valid JSON File
        it('TC16: should import tasks from valid JSON file', async () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const validTasks = [
                {
                    title: 'Imported Task 1',
                    description: 'First imported task',
                    dueDate: '2025-12-31'
                },
                {
                    title: 'Imported Task 2',
                    description: 'Second imported task',
                    dueDate: 'No due date'
                }
            ];

            const jsonContent = JSON.stringify(validTasks);
            const mockFile = createMockBlob(jsonContent, 'application/json');
            mockFile.name = 'tasks.json';

            const payload = { tasksFile: mockFile };

            return new Promise((resolve) => {
                mockApp.methods.onImport.call(mockApp, payload);

                setTimeout(() => {
                    expect(mockApp.showImportConfirm).toBe(true);
                    expect(mockApp.importedTasksPreview.length).toBe(2);
                    expect(mockApp.importedTasksPreview[0].title).toBe('Imported Task 1');
                    expect(mockApp.importedTasksPreview[1].title).toBe('Imported Task 2');
                    resolve();
                }, 50); // Erhöhtes Timeout für FileReader
            });
        });

        // TC17: Import Invalid File Type
        it('TC17: should handle invalid JSON content', async () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const invalidContent = 'This is not JSON content';
            const mockFile = createMockBlob(invalidContent, 'text/plain');
            mockFile.name = 'tasks.txt';

            const payload = { tasksFile: mockFile };

            return new Promise((resolve) => {
                mockApp.methods.onImport.call(mockApp, payload);

                setTimeout(() => {
                    // Alert wurde aufgerufen (JSON Parse Fehler)
                    expect(window.alert).toHaveBeenCalled();
                    expect(mockApp.showImportConfirm).toBe(false);
                    resolve();
                }, 50);
            });
        });

        // TC18: Import Without Selecting File
        it('TC18: should handle missing file gracefully', () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const payload = { tasksFile: null };

            expect(() => {
                mockApp.methods.onImport.call(mockApp, payload);
            }).not.toThrow();

            expect(mockApp.showImportConfirm).toBe(false);
        });

        // TC19: Imported Tasks Appear (confirmed import)
        it('TC19: should add imported tasks to task list after confirmation', () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const importedTasks = [
                {
                    id: 'imported-1',
                    title: 'Imported Task',
                    description: 'Test import',
                    completed: false,
                    createdAt: '2025-01-01T00:00:00.000Z'
                }
            ];

            mockApp.importedTasksPreview = importedTasks;
            mockApp.tasks = [
                {
                    id: 'existing-1',
                    title: 'Existing Task',
                    createdAt: '2025-01-02T00:00:00.000Z'
                }
            ];

            mockApp.methods.confirmImport.call(mockApp);

            expect(mockApp.tasks.length).toBe(2);
            expect(mockApp.tasks.some(t => t.title === 'Imported Task')).toBe(true);
            expect(mockApp.tasks.some(t => t.title === 'Existing Task')).toBe(true);
            expect(mockApp.showImportConfirm).toBe(false);
            expect(mockApp.importedTasksPreview.length).toBe(0);
            expect(mockApp.saveTasks).toHaveBeenCalled();
        });

        // R6.1: Allow import from valid JSON file
        it('R6.1: should allow importing tasks from valid JSON', async () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const validTasks = [
                { title: 'Task 1', description: 'Description 1' },
                { title: 'Task 2', description: 'Description 2' }
            ];

            const jsonContent = JSON.stringify(validTasks);
            const mockFile = createMockBlob(jsonContent);

            const payload = { tasksFile: mockFile };

            return new Promise((resolve) => {
                mockApp.methods.onImport.call(mockApp, payload);

                setTimeout(() => {
                    expect(mockApp.importedTasksPreview.length).toBe(2);
                    resolve();
                }, 50);
            });
        });

        // R6.2: Error for non-JSON file type
        it('R6.2: should handle invalid JSON content gracefully', async () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const invalidContent = 'Invalid JSON content {';
            const mockFile = createMockBlob(invalidContent);

            const payload = { tasksFile: mockFile };

            return new Promise((resolve) => {
                mockApp.methods.onImport.call(mockApp, payload);

                setTimeout(() => {
                    // Should call alert for JSON parse error
                    expect(window.alert).toHaveBeenCalled();
                    resolve();
                }, 50);
            });
        });

        // R6.3: Error when no file selected
        it('R6.3: should handle case where no file is provided', () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const payload = { tasksFile: undefined };

            expect(() => {
                mockApp.methods.onImport.call(mockApp, payload);
            }).not.toThrow();

            expect(mockApp.showImportConfirm).toBe(false);
        });

        // R6.4: Successfully imported tasks shown in list
        it('R6.4: should show imported tasks in task list after confirmation', () => {
            // Explizit alle Tasks und Preview-Tasks löschen für saubere Testisolation
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            // Setze die Test-Tasks
            mockApp.importedTasksPreview = [
                { id: 'imp-1', title: 'Imported 1', createdAt: '2025-01-01T00:00:00.000Z' },
                { id: 'imp-2', title: 'Imported 2', createdAt: '2025-01-01T00:00:00.000Z' }
            ];

            mockApp.methods.confirmImport.call(mockApp);

            expect(mockApp.tasks.length).toBe(2);
            expect(mockApp.tasks.some(t => t.title === 'Imported 1')).toBe(true);
            expect(mockApp.tasks.some(t => t.title === 'Imported 2')).toBe(true);
        });

        it('should handle empty JSON array', async () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const emptyArray = JSON.stringify([]);
            const mockFile = createMockBlob(emptyArray);

            const payload = { tasksFile: mockFile };

            return new Promise((resolve) => {
                mockApp.methods.onImport.call(mockApp, payload);

                setTimeout(() => {
                    // Empty array triggers "No valid tasks found" alert
                    expect(window.alert).toHaveBeenCalled();
                    expect(mockApp.showImportConfirm).toBe(false);
                    resolve();
                }, 50);
            });
        });

        it('should filter out tasks without titles during import', async () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const tasksWithMissingTitles = [
                { title: 'Valid Task', description: 'Good task' },
                { title: '', description: 'Invalid - empty title' },
                { description: 'Invalid - no title property' },
                { title: null, description: 'Invalid - null title' }
            ];

            const jsonContent = JSON.stringify(tasksWithMissingTitles);
            const mockFile = createMockBlob(jsonContent);

            const payload = { tasksFile: mockFile };

            return new Promise((resolve) => {
                mockApp.methods.onImport.call(mockApp, payload);

                setTimeout(() => {
                    expect(mockApp.importedTasksPreview.length).toBe(1);
                    expect(mockApp.importedTasksPreview[0].title).toBe('Valid Task');
                    resolve();
                }, 50);
            });
        });

        it('should handle non-array JSON content', async () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const nonArrayContent = JSON.stringify({ not: 'an array' });
            const mockFile = createMockBlob(nonArrayContent);

            const payload = { tasksFile: mockFile };

            return new Promise((resolve) => {
                mockApp.methods.onImport.call(mockApp, payload);

                setTimeout(() => {
                    // Non-array triggers specific alert message
                    expect(window.alert).toHaveBeenCalled();
                    resolve();
                }, 50);
            });
        });

        it('should generate new IDs for imported tasks', async () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            const importedTasks = [
                { id: 'old-id-1', title: 'Task 1' },
                { id: 'old-id-2', title: 'Task 2' }
            ];

            const jsonContent = JSON.stringify(importedTasks);
            const mockFile = createMockBlob(jsonContent);

            const payload = { tasksFile: mockFile };

            return new Promise((resolve) => {
                mockApp.methods.onImport.call(mockApp, payload);

                setTimeout(() => {
                    const preview = mockApp.importedTasksPreview;
                    expect(preview.length).toBe(2);
                    expect(preview[0].id).not.toBe('old-id-1');
                    expect(preview[1].id).not.toBe('old-id-2');
                    expect(preview[0].id).toBeDefined();
                    expect(preview[1].id).toBeDefined();
                    resolve();
                }, 50);
            });
        });

        it('should cancel import and clear preview', () => {
            // Explizite Isolation - leere alle Task Arrays
            mockApp.tasks = [];
            mockApp.importedTasksPreview = [];

            mockApp.showImportConfirm = true;
            mockApp.importedTasksPreview = [{ id: '1', title: 'Test' }];

            mockApp.methods.cancelImport.call(mockApp);

            expect(mockApp.showImportConfirm).toBe(false);
            expect(mockApp.importedTasksPreview.length).toBe(0);
        });
    });
};
