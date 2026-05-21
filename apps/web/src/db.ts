import { openDB, type DBSchema } from "idb";

type Category = "work" | "personal" | "other";
type Status = "pending" | "completed" | "archived";

/**
 * Registro persistido no IndexedDB.
 * `localId` é a chave primária auto-increment e fica disponível após a inserção.
 * `referenceId` é o UUID que identifica o item no servidor.
 */
export type TodoRecord = {
    localId?: number;
    referenceId: string;
    title: string;
    body: string;
    category: Category;
    status: Status;
};

interface MultitodoDB extends DBSchema {
    todos: {
        key: number;
        value: TodoRecord;
        indexes: { "by-referenceId": string };
    };
}

let _db: ReturnType<typeof openDB<MultitodoDB>> | null = null;
const DB_NAME = "multitodo";
const DB_VERSION = 2;

function conn() {
    return (_db ??= openDB<MultitodoDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (db.objectStoreNames.contains("todos")) return;
            const store = db.createObjectStore("todos", {
                keyPath: "localId",
                autoIncrement: true,
            });
            store.createIndex("by-referenceId", "referenceId", { unique: true });
        },
    }));
}

/** Retorna todos os registros em ordem de inserção (localId asc). */
export async function idbGetAll(): Promise<TodoRecord[]> {
    return (await conn()).getAll("todos");
}

/** Insere um novo item. Retorna o localId gerado. */
export async function idbAdd(record: Omit<TodoRecord, "localId">): Promise<number> {
    return (await conn()).add("todos", record as TodoRecord);
}

/** Atualiza o status de um item pelo referenceId. */
export async function idbUpdateStatus(referenceId: string, status: Status): Promise<void> {
    const c = await conn();
    const existing = await c.getFromIndex("todos", "by-referenceId", referenceId);
    if (!existing) return;
    await c.put("todos", { ...existing, status });
}

/** Remove um item pelo referenceId. */
export async function idbDelete(referenceId: string): Promise<void> {
    const c = await conn();
    const existing = await c.getFromIndex("todos", "by-referenceId", referenceId);
    if (existing?.localId !== undefined) {
        await c.delete("todos", existing.localId);
    }
}
