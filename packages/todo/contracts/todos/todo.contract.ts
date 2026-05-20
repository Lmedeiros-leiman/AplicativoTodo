import { z } from "zod";

/** Schema Zod para a categoria de um todo. Valores: `work`, `personal`, `other`. */
export const todoCategorySchema = z.enum(["work", "personal", "other"]);

/** Schema Zod para o status de um todo. Valores: `pending`, `completed`, `archived`. */
export const todoStatusSchema = z.enum(["pending", "completed", "archived"]);

/** Schema Zod para o id de um todo. String não-vazia após trim. */
export const todoIdSchema = z.string().trim().min(1);

/** Schema completo de um TodoItem retornado pela API. */
export const todoSchema = z.object({
    id: todoIdSchema,
    title: z.string(),
    body: z.string(),
    category: todoCategorySchema,
    status: todoStatusSchema,
});

/** Schema de criação. `category` é opcional (o servidor aplica o default `personal`). */
export const createTodoSchema = z.object({
    id: todoIdSchema,
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    category: todoCategorySchema.optional(),
});

/** Schema para alterar apenas o título. */
export const changeTodoTitleSchema = z.object({
    title: z.string().trim().min(1),
});

/** Schema para alterar apenas o corpo. */
export const changeTodoBodySchema = z.object({
    body: z.string().trim().min(1),
});

/** Schema para alterar apenas a categoria. */
export const changeTodoCategorySchema = z.object({
    category: todoCategorySchema,
});

/** DTO de leitura de um TodoItem. */
export type TodoDto = z.infer<typeof todoSchema>;

/** DTO de criação de um TodoItem. */
export type CreateTodoDto = z.infer<typeof createTodoSchema>;

/** DTO para alteração de título. */
export type ChangeTodoTitleDto = z.infer<typeof changeTodoTitleSchema>;

/** DTO para alteração de corpo. */
export type ChangeTodoBodyDto = z.infer<typeof changeTodoBodySchema>;

/** DTO para alteração de categoria. */
export type ChangeTodoCategoryDto = z.infer<typeof changeTodoCategorySchema>;
