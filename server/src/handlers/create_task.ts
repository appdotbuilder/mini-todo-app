import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput, type Task } from '../schema';

export const createTask = async (input: CreateTaskInput): Promise<Task> => {
  try {
    // Insert task record
    const result = await db.insert(tasksTable)
      .values({
        title: input.title
        // status defaults to 'pending' in database schema
        // created_at defaults to NOW() in database schema
      })
      .returning()
      .execute();

    // Return the created task
    const task = result[0];
    return {
      ...task,
      created_at: task.created_at // Already a Date object from timestamp column
    };
  } catch (error) {
    console.error('Task creation failed:', error);
    throw error;
  }
};