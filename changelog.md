**Changelog Message Standard**:
- **Format**: [VERSION] [TYPE]: <description> (awaiting approval | denied | approved)
  - **e.g.** v1.2.0 feat: add user login endpoint (approved)
- **Types**: *feat*, *fix*, *docs*, *style*, *refactor*, *test*, *chore*

__***Ensure all changes are approved by consensus with all team members.***__ <br />
*Refer to [version control](https://scu-it.atlassian.net/wiki/spaces/MSD425GC2/pages/329744404/Configuration+Management#3.-Version-Control) for further information re: version control formatting.*

v.0.0.0 docs: Create changelog.md with versioning guidelines (approved)
v.0.1.0 chore: Initial commit

v.0.2.0 feat: UI add task button
- Created minimal “New Task” button that triggers the create new task form (blank form)
- No persistence or extra fields yet title-only creation coming next

 v.0.2.1 feat add task form model and in memory task creation
 - Introduced <TaskForm> modal with title field and Save/Cancel
 - Added basic validation (title required)
 - Created tasks are stored in memory and rendered in a simple list (title only)
 - new task button opens taskform modal and creates an event

