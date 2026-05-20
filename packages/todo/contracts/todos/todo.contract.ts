import { z } from "zod";

export const todoCategorySchema = z.enum(["work", "personal", "other"]);
export const todoStatusSchema = z.enum(["pending", "completed", "archived"]);

export const todoIdSchema = z.string().trim().min(1);

export const todoSchema = z.object({
    id: todoIdSchema,
    title: z.string(),
    body: z.string(),
    category: todoCategorySchema,
    status: todoStatusSchema,
});

export const createTodoSchema = z.object({
    id: todoIdSchema,
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    category: todoCategorySchema.optional(),
});

export const changeTodoTitleSchema = z.object({
    title: z.string().trim().min(1),
});

export const changeTodoBodySchema = z.object({
    body: z.string().trim().min(1),
});

export const changeTodoCategorySchema = z.object({
    category: todoCategorySchema,
});

export type TodoDto = z.infer<typeof todoSchema>;
export type CreateTodoDto = z.infer<typeof createTodoSchema>;
export type ChangeTodoTitleDto = z.infer<typeof changeTodoTitleSchema>;
export type ChangeTodoBodyDto = z.infer<typeof changeTodoBodySchema>;
export type ChangeTodoCategoryDto = z.infer<typeof changeTodoCategorySchema>;
