import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { Task } from "../types/task";
import { Context } from "./context";

const t = initTRPC.context<Context>().create();

// In-memory task store
export let tasks: Task[] = [
  { id: 1, description: "Complete the project report", completed: false },
  { id: 2, description: "Clean the house", completed: true },
];

export const appRouter = t.router({
  getTasks: t.procedure.query(() => {
    return tasks;
  }),

  getTaskById: t.procedure.input(z.number()).query(({ input }) => {
    const task = tasks.find((task) => task.id === input);

    if (!task) {
      throw new Error("Task not found");
    }

    return task;
  }),

  createTask: t.procedure
    .input(
      z.object({
        description: z.string(),
        completed: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const newTask: Task = {
        id: tasks.length + 1,
        description: input.description,
        completed: input.completed ?? false,
      };

      tasks.push(newTask);

      return newTask;
    }),

  updateTask: t.procedure
    .input(
      z.object({
        id: z.number(),
        description: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(({ input }) => {
      const taskIndex = tasks.findIndex((task) => task.id === input.id);

      if (taskIndex === -1) {
        throw new Error("Task not found");
      }

      const updatedTask: Task = {
        id: input.id,
        description: input.description,
        completed: input.completed,
      };

      tasks[taskIndex] = updatedTask;

      return updatedTask;
    }),

  deleteTask: t.procedure.input(z.number()).mutation(({ input }) => {
    const taskIndex = tasks.findIndex((task) => task.id === input);

    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    tasks.splice(taskIndex, 1);

    return {
      message: "Task deleted",
    };
  }),
});

export type AppRouter = typeof appRouter;