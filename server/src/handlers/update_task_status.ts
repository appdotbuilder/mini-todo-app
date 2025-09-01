import { db } from '../db';
import { tasksTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateTaskStatusInput, type Task } from '../schema';

export const updateTaskStatus = async (input: UpdateTaskStatusInput): Promise<Task> => {
  try {
    // Update the task status and return the updated record
    const result = await db.update(tasksTable)
      .set({
        status: input.status
      })
      .where(eq(tasksTable.id, input.id))
      .returning()
      .execute();

    // Check if task was found and updated
    if (result.length === 0) {
      throw new Error(`Task with ID ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Task status update failed:', error);
    throw error;
  }
};