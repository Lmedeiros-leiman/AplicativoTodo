import { TodoItem, TodoItemId, type TodoItemCategory, type TodoItemStatus } from "@multitodo/todo-domain";
import type { PersistableTodoItem, TodoItemPersistence } from "./todo-item-persistence.js";

const TODO_ITEM_CATEGORIES = ["work", "personal", "other"] as const;
const TODO_ITEM_STATUSES = ["pending", "completed", "archived"] as const;

/**
 * Converte TodoItems entre a representação de domínio e a de persistência.
 *
 * Responsabilidades:
 * - `toDomain`: hidrata um {@link TodoItem} a partir de uma linha do banco.
 * - `toPersistence`: serializa um {@link TodoItem} para gravação no banco.
 *
 * Garante que valores inválidos de `category` ou `status` vindos do banco
 * causem erro explícito em vez de corromper o estado do domínio.
 */
export class TodoItemPersistenceMapper {
    /**
     * Converte uma linha do banco em um {@link TodoItem} de domínio.
     *
     * @param row - Linha lida do banco via {@link TodoItemPersistence}.
     * @throws {Error} Se `category` ou `status` contiverem valor desconhecido.
     */
    static toDomain(row: TodoItemPersistence): TodoItem {
        return TodoItem.restore({
            id: TodoItemId.create(row.id.referenceId),
            title: row.title,
            body: row.body,
            category: this.toCategory(row.category),
            status: this.toStatus(row.status)
        });
    }

    /**
     * Converte um {@link TodoItem} em um objeto pronto para insert/update.
     *
     * @param todoItem - Agregado a serializar.
     * @param databaseId - Chave primária do banco. Omitido em novos registros.
     */
    static toPersistence(todoItem: TodoItem, databaseId?: number): PersistableTodoItem {
        const snapshot = todoItem.toSnapshot();

        return {
            id: {
                ...(databaseId === undefined ? {} : { databaseId }),
                referenceId: snapshot.id,
            },
            title: snapshot.title,
            body: snapshot.body,
            category: snapshot.category,
            status: snapshot.status,
        };
    }

    /**
     * @throws {Error} Se o valor não pertencer ao enum de categorias.
     */
    private static toCategory(category: string): TodoItemCategory {
        if (TODO_ITEM_CATEGORIES.includes(category as TodoItemCategory)) {
            return category as TodoItemCategory;
        }

        throw new Error(`Invalid todo item category: ${category}`);
    }

    /**
     * @throws {Error} Se o valor não pertencer ao enum de statuses.
     */
    private static toStatus(status: string): TodoItemStatus {
        if (TODO_ITEM_STATUSES.includes(status as TodoItemStatus)) {
            return status as TodoItemStatus;
        }

        throw new Error(`Invalid todo item status: ${status}`);
    }
}
