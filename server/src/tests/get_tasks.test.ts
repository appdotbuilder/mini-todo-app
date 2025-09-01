import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { getTasks } from '../handlers/get_tasks';

// Test data
const testTask1: CreateTaskInput = {
  title: 'First task'
};

const testTask2: CreateTaskInput = {
  title: 'Second task'
};

const testTask3: CreateTaskInput = {
  title: 'Third task'
};

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all tasks from database', async () => {
    // Create test tasks
    await db.insert(tasksTable)
      .values([
        { title: testTask1.title },
        { title: testTask2.title },
        { title: testTask3.title }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(3);
    expect(result.map(t => t.title)).toContain(testTask1.title);
    expect(result.map(t => t.title)).toContain(testTask2.title);
    expect(result.map(t => t.title)).toContain(testTask3.title);
  });

  it('should return tasks ordered by creation date (newest first)', async () => {
    // Create tasks with slight delay to ensure different timestamps
    await db.insert(tasksTable)
      .values({ title: 'First created task' })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(tasksTable)
      .values({ title: 'Second created task' })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(tasksTable)
      .values({ title: 'Third created task' })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('Third created task'); // Newest first
    expect(result[1].title).toBe('Second created task');
    expect(result[2].title).toBe('First created task'); // Oldest last

    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should return tasks with all required fields', async () => {
    await db.insert(tasksTable)
      .values({ title: 'Test task with all fields' })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(1);
    const task = result[0];

    expect(task.id).toBeDefined();
    expect(typeof task.id).toBe('number');
    expect(task.title).toBe('Test task with all fields');
    expect(task.status).toBe('pending'); // Default status
    expect(task.created_at).toBeInstanceOf(Date);
  });

  it('should return tasks with different statuses', async () => {
    // Create tasks with different statuses
    await db.insert(tasksTable)
      .values([
        { title: 'Pending task', status: 'pending' },
        { title: 'Completed task', status: 'completed' }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    
    const pendingTask = result.find(t => t.title === 'Pending task');
    const completedTask = result.find(t => t.title === 'Completed task');

    expect(pendingTask?.status).toBe('pending');
    expect(completedTask?.status).toBe('completed');
  });

  it('should handle large number of tasks', async () => {
    // Create 100 tasks
    const taskValues = Array.from({ length: 100 }, (_, i) => ({
      title: `Task ${i + 1}`
    }));

    await db.insert(tasksTable)
      .values(taskValues)
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(100);
    expect(result.every(task => task.id !== undefined)).toBe(true);
    expect(result.every(task => task.title.startsWith('Task'))).toBe(true);
    expect(result.every(task => task.created_at instanceof Date)).toBe(true);
  });
});