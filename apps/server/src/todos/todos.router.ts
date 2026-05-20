import { TodoItemId } from "@multitodo/todo-domain";
import {
    todoIdSchema,
    createTodoSchema,
    changeTodoTitleSchema,
    changeTodoBodySchema,
    changeTodoCategorySchema,
} from "@multitodo/todo-contracts-layer";
import { router, publicProcedure } from "../trpc.js";

export const todosRouter = router({
    /** Retorna todos os itens. */
    list: publicProcedure.query(async ({ ctx }) => {
        const items = await ctx.todos.repository.findAll();
        return items.map(item => item.toSnapshot());
    }),

    /** Retorna um item pelo seu `id`. Lança erro se não encontrado. */
    getById: publicProcedure
        .input(todoIdSchema)
        .query(async ({ ctx, input }) => {
            const item = await ctx.todos.repository.findById(TodoItemId.create(input));
            if (!item) throw new Error("Todo item not found");
            return item.toSnapshot();
        }),

    /** Cria um novo item. `category` é opcional (padrão: `personal`). */
    create: publicProcedure
        .input(createTodoSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.todos.create.execute({
                id: TodoItemId.create(input.id),
                title: input.title,
                body: input.body,
                ...(input.category !== undefined && { category: input.category }),
            });
        }),

    /** Altera o título de um item. */
    changeTitle: publicProcedure
        .input(changeTodoTitleSchema.extend({ id: todoIdSchema }))
        .mutation(async ({ ctx, input }) => {
            await ctx.todos.changeTitle.execute({
                id: TodoItemId.create(input.id),
                title: input.title,
            });
        }),

    /** Altera o corpo de um item. */
    changeBody: publicProcedure
        .input(changeTodoBodySchema.extend({ id: todoIdSchema }))
        .mutation(async ({ ctx, input }) => {
            await ctx.todos.changeBody.execute({
                id: TodoItemId.create(input.id),
                body: input.body,
            });
        }),

    /** Altera a categoria de um item (`work` | `personal` | `other`). */
    changeCategory: publicProcedure
        .input(changeTodoCategorySchema.extend({ id: todoIdSchema }))
        .mutation(async ({ ctx, input }) => {
            await ctx.todos.changeCategory.execute({
                id: TodoItemId.create(input.id),
                category: input.category,
            });
        }),

    /** Marca um item como concluído (`completed`). */
    markCompleted: publicProcedure
        .input(todoIdSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.todos.markCompleted.execute(TodoItemId.create(input));
        }),

    /** Remove a marcação de concluído, voltando para `pending`. */
    unmarkCompleted: publicProcedure
        .input(todoIdSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.todos.unmarkCompleted.execute(TodoItemId.create(input));
        }),

    /** Move um item para o arquivo (`archived`). */
    archive: publicProcedure
        .input(todoIdSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.todos.archive.execute(TodoItemId.create(input));
        }),

    /** Restaura um item arquivado para `pending`. */
    restore: publicProcedure
        .input(todoIdSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.todos.restore.execute(TodoItemId.create(input));
        }),

    /** Remove permanentemente um item. */
    delete: publicProcedure
        .input(todoIdSchema)
        .mutation(async ({ ctx, input }) => {
            await ctx.todos.repository.deleteById(TodoItemId.create(input));
        }),
});
