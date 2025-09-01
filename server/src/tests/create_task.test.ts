import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { createTask } from '../handlers/create_task';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTaskInput = {
  title: 'Complete project documentation'
};

describe('createTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a task with default pending status', async () => {
    const result = await createTask(testInput);

    // Basic field validation
    expect(result.title).toEqual('Complete project documentation');
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save task to database', async () => {
    const result = await createTask(testInput);

    // Query using proper drizzle syntax
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toEqual('Complete project documentation');
    expect(tasks[0].status).toEqual('pending');
    expect(tasks[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle minimal task title', async () => {
    const minimalInput: CreateTaskInput = {
      title: 'A'
    };

    const result = await createTask(minimalInput);
    
    expect(result.title).toEqual('A');
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
  });

  it('should handle long task titles', async () => {
    const longTitleInput: CreateTaskInput = {
      title: 'This is a very long task title that contains multiple words and describes a complex task that needs to be completed with attention to detail and proper implementation'
    };

    const result = await createTask(longTitleInput);
    
    expect(result.title).toEqual(longTitleInput.title);
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
  });

  it('should create multiple tasks with unique IDs', async () => {
    const task1 = await createTask({ title: 'First task' });
    const task2 = await createTask({ title: 'Second task' });
    const task3 = await createTask({ title: 'Third task' });

    // All should have unique IDs
    expect(task1.id).not.toEqual(task2.id);
    expect(task2.id).not.toEqual(task3.id);
    expect(task1.id).not.toEqual(task3.id);

    // All should have correct titles
    expect(task1.title).toEqual('First task');
    expect(task2.title).toEqual('Second task');
    expect(task3.title).toEqual('Third task');

    // All should default to pending status
    expect(task1.status).toEqual('pending');
    expect(task2.status).toEqual('pending');
    expect(task3.status).toEqual('pending');

    // Verify all are persisted in database
    const allTasks = await db.select()
      .from(tasksTable)
      .execute();

    expect(allTasks).toHaveLength(3);
  });

  it('should set created_at timestamp correctly', async () => {
    const beforeCreation = new Date();
    
    const result = await createTask(testInput);
    
    const afterCreation = new Date();

    // Check that created_at is between before and after timestamps
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });
});