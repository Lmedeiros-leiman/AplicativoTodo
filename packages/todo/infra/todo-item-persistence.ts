import type { TodoItemCategory, TodoItemStatus } from "@multitodo/todo-domain";

/**
 * Identificador de um item como vem do banco — inclui a chave
 * auto-incrementada (`databaseId`) e o identificador de negócio (`referenceId`).
 */
export type TodoItemPersistenceId = {
    /** Chave primária auto-incrementada do SQLite. */
    databaseId: number;
    /** Identificador de negócio (ex: UUID). Equivale a {@link TodoItemId}. */
    referenceId: string;
};

/**
 * Representação de um item exatamente como lido do banco.
 * `category` e `status` chegam como `string` bruta — o mapper
 * valida e converte para os tipos do domínio.
 */
export type TodoItemPersistence = {
    id: TodoItemPersistenceId;
    title: string;
    body: string;
    /** Valor bruto do banco. Validado por {@link TodoItemPersistenceMapper.toDomain}. */
    category: string;
    /** Valor bruto do banco. Validado por {@link TodoItemPersistenceMapper.toDomain}. */
    status: string;
    createdAt: Date;
    lastlyUpdatedAt: Date;
};

/**
 * Identificador usado na operação de escrita.
 * `databaseId` é omitido em inserts e preenchido em updates.
 */
export type PersistableTodoItemId = {
    databaseId?: number;
    referenceId: string;
};

/**
 * Representação de um item pronto para ser gravado no banco.
 * Produzido por {@link TodoItemPersistenceMapper.toPersistence}.
 */
export type PersistableTodoItem = {
    id: PersistableTodoItemId;
    title: string;
    body: string;
    category: TodoItemCategory;
    status: TodoItemStatus;
};
