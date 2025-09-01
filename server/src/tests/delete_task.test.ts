import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput, type CreateTaskInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

// Test input for deleting tasks
const testDeleteInput: DeleteTaskInput = {
  id: 1
};

// Test input for creating prerequisite tasks
const testCreateInput: CreateTaskInput = {
  title: 'Test Task to Delete'
};

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task', async () => {
    // First create a task to delete
    const createdTask = await db.insert(tasksTable)
      .values({
        title: testCreateInput.title,
        status: 'pending'
      })
      .returning()
      .execute();

    const taskId = createdTask[0].id;

    // Delete the task
    const result = await deleteTask({ id: taskId });

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify task no longer exists in database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .execute();

    expect(tasks).toHaveLength(0);
  });

  it('should return success false for non-existent task', async () => {
    // Try to delete a task that doesn't exist
    const result = await deleteTask({ id: 999 });

    // Should return false since no rows were affected
    expect(result.success).toBe(false);
  });

  it('should not affect other tasks when deleting specific task', async () => {
    // Create multiple tasks
    const task1 = await db.insert(tasksTable)
      .values({
        title: 'Task 1',
        status: 'pending'
      })
      .returning()
      .execute();

    const task2 = await db.insert(tasksTable)
      .values({
        title: 'Task 2', 
        status: 'completed'
      })
      .returning()
      .execute();

    const task3 = await db.insert(tasksTable)
      .values({
        title: 'Task 3',
        status: 'pending'
      })
      .returning()
      .execute();

    // Delete the middle task
    const result = await deleteTask({ id: task2[0].id });

    expect(result.success).toBe(true);

    // Verify other tasks still exist
    const remainingTasks = await db.select()
      .from(tasksTable)
      .execute();

    expect(remainingTasks).toHaveLength(2);
    
    // Verify specific tasks still exist
    const taskIds = remainingTasks.map(task => task.id);
    expect(taskIds).toContain(task1[0].id);
    expect(taskIds).toContain(task3[0].id);
    expect(taskIds).not.toContain(task2[0].id);
  });

  it('should delete tasks with different statuses', async () => {
    // Create tasks with different statuses
    const pendingTask = await db.insert(tasksTable)
      .values({
        title: 'Pending Task',
        status: 'pending'
      })
      .returning()
      .execute();

    const completedTask = await db.insert(tasksTable)
      .values({
        title: 'Completed Task',
        status: 'completed'
      })
      .returning()
      .execute();

    // Delete pending task
    const pendingResult = await deleteTask({ id: pendingTask[0].id });
    expect(pendingResult.success).toBe(true);

    // Delete completed task
    const completedResult = await deleteTask({ id: completedTask[0].id });
    expect(completedResult.success).toBe(true);

    // Verify both are deleted
    const remainingTasks = await db.select()
      .from(tasksTable)
      .execute();

    expect(remainingTasks).toHaveLength(0);
  });

  it('should handle deletion of already deleted task', async () => {
    // Create a task
    const task = await db.insert(tasksTable)
      .values({
        title: 'Task to delete twice',
        status: 'pending'
      })
      .returning()
      .execute();

    const taskId = task[0].id;

    // Delete the task first time
    const firstResult = await deleteTask({ id: taskId });
    expect(firstResult.success).toBe(true);

    // Try to delete the same task again
    const secondResult = await deleteTask({ id: taskId });
    expect(secondResult.success).toBe(false);
  });
});