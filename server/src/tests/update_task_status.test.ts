import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateTaskStatusInput } from '../schema';
import { updateTaskStatus } from '../handlers/update_task_status';

describe('updateTaskStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task status from pending to completed', async () => {
    // Create a test task
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        status: 'pending'
      })
      .returning()
      .execute();

    const taskId = createResult[0].id;

    // Update task status
    const input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'completed'
    };

    const result = await updateTaskStatus(input);

    // Verify the updated task
    expect(result.id).toEqual(taskId);
    expect(result.title).toEqual('Test Task');
    expect(result.status).toEqual('completed');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update task status from completed to pending', async () => {
    // Create a test task with completed status
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Completed Task',
        status: 'completed'
      })
      .returning()
      .execute();

    const taskId = createResult[0].id;

    // Update task status back to pending
    const input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'pending'
    };

    const result = await updateTaskStatus(input);

    // Verify the updated task
    expect(result.id).toEqual(taskId);
    expect(result.title).toEqual('Completed Task');
    expect(result.status).toEqual('pending');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should persist status change in database', async () => {
    // Create a test task
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Persistence Test Task',
        status: 'pending'
      })
      .returning()
      .execute();

    const taskId = createResult[0].id;

    // Update task status
    const input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'completed'
    };

    await updateTaskStatus(input);

    // Query database directly to verify persistence
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toEqual(taskId);
    expect(tasks[0].title).toEqual('Persistence Test Task');
    expect(tasks[0].status).toEqual('completed');
    expect(tasks[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when task does not exist', async () => {
    const input: UpdateTaskStatusInput = {
      id: 999999, // Non-existent task ID
      status: 'completed'
    };

    await expect(updateTaskStatus(input)).rejects.toThrow(/Task with ID 999999 not found/i);
  });

  it('should preserve original created_at timestamp', async () => {
    // Create a test task
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Timestamp Test Task',
        status: 'pending'
      })
      .returning()
      .execute();

    const taskId = createResult[0].id;
    const originalCreatedAt = createResult[0].created_at;

    // Wait a bit to ensure timestamp would be different if updated
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update task status
    const input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'completed'
    };

    const result = await updateTaskStatus(input);

    // Verify that created_at timestamp remains unchanged
    expect(result.created_at).toEqual(originalCreatedAt);
    expect(result.status).toEqual('completed');
  });

  it('should handle multiple status updates correctly', async () => {
    // Create a test task
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Multi-Update Task',
        status: 'pending'
      })
      .returning()
      .execute();

    const taskId = createResult[0].id;

    // First update: pending -> completed
    let input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'completed'
    };

    let result = await updateTaskStatus(input);
    expect(result.status).toEqual('completed');

    // Second update: completed -> pending
    input = {
      id: taskId,
      status: 'pending'
    };

    result = await updateTaskStatus(input);
    expect(result.status).toEqual('pending');

    // Third update: pending -> completed again
    input = {
      id: taskId,
      status: 'completed'
    };

    result = await updateTaskStatus(input);
    expect(result.status).toEqual('completed');
    expect(result.title).toEqual('Multi-Update Task'); // Title should remain unchanged
  });
});