import type { TodoItem } from "../entities/todo.entity.js";
import type { TodoItemId } from "../value-objects/todo-item-id.js";

/**
 * Porta de saída do domínio para persistência de TodoItems.
 *
 * Definida no domínio e implementada na camada de infraestrutura
 * (ex: {@link DrizzleTodoItemRepository}). Nenhuma dependência de banco
 * de dados deve aparecer aqui.
 */
export interface TodoItemRepository {
    /**
     * Persiste um item. Se já existir um item com o mesmo `id`,
     * atualiza seus dados (upsert).
     */
    save(todoItem: TodoItem): Promise<void>;

    /**
     * Busca um item pelo seu identificador.
     *
     * @returns O item encontrado, ou `null` se não existir.
     */
    findById(id: TodoItemId): Promise<TodoItem | null>;

    /** Retorna todos os itens sem filtro. */
    findAll(): Promise<TodoItem[]>;

    /**
     * Remove permanentemente um item.
     * Não lança erro se o id não existir.
     */
    deleteById(id: TodoItemId): Promise<void>;
}
