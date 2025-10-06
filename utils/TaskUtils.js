function createTask({ id, title, dueDate, description, priority, createdAt }) {
    return {
        id: id || generateUid(),
        title: String(title || '').trim(),
        dueDate: typeof dueDate === 'undefined' || 'NaN' ? 'No due date' : String(dueDate).trim(),
        description: String(description || '').trim(),
        priority: Number(priority) || 1,
        createdAt: createdAt || new Date().toISOString()
    };
}

function generateUid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const TaskUtils = {
    createTask,
    generateUid
}
