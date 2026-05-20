import { TodoItemId } from "../value-objects/todo-item-id.js";

/** Ciclo de vida de um item: pendente → concluído → arquivado. */
export type TodoItemStatus = "pending" | "completed" | "archived";

/** Classificação do item para organização. */
export type TodoItemCategory = "work" | "personal" | "other";

/** Estado interno completo do agregado. Nunca exposto diretamente. */
export type TodoItemProps = {
    id: TodoItemId;
    title: string;
    body: string;
    category: TodoItemCategory;
    status: TodoItemStatus;
};

/**
 * Props aceitas por {@link TodoItem.create}.
 *
 * `category` e `status` são opcionais — o domínio aplica os defaults
 * (`personal` e `pending`, respectivamente).
 */
export type CreateTodoItemProps = {
    id: TodoItemId;
    title: string;
    body: string;
    category?: TodoItemCategory;
    status?: TodoItemStatus;
};

/**
 * Representação somente-leitura do estado do item.
 * Usada para cruzar fronteiras de camada (repositório, controller, tRPC).
 */
export type TodoItemSnapshot = {
    id: string;
    title: string;
    body: string;
    category: TodoItemCategory;
    status: TodoItemStatus;
};

/**
 * Agregado raiz do domínio de tarefas.
 *
 * Toda mutação passa pelos factory methods `create` ou `restore` —
 * o construtor privado impede instanciação arbitrária.
 */
export class TodoItem {
    private constructor(private props: TodoItemProps) { }

    /**
     * Cria um novo item aplicando regras de negócio.
     *
     * - Faz trim em `title` e `body`.
     * - Aplica defaults: `category = "personal"`, `status = "pending"`.
     *
     * @throws {Error} Se `title` ou `body` ficarem vazios após trim.
     */
    static create(props: CreateTodoItemProps): TodoItem {
        const title = props.title.trim();
        const body = props.body.trim();

        if (!title) {
            throw new Error("Title must not be empty");
        }

        if (!body) {
            throw new Error("Body must not be empty");
        }

        return new TodoItem({
            id: props.id,
            title,
            body,
            category: props.category ?? "personal",
            status: props.status ?? "pending"
        });
    }

    /**
     * Reconstrói um item a partir de dados persistidos, sem validação.
     * Usado exclusivamente pelo repositório ao hidratar do banco.
     */
    static restore(props: TodoItemProps): TodoItem {
        return new TodoItem({ ...props });
    }

    /**
     * Retorna uma cópia somente-leitura do estado atual.
     * É a única forma de ler os dados internos do agregado.
     */
    toSnapshot(): Readonly<TodoItemSnapshot> {
        return {
            id: this.props.id.toString(),
            title: this.props.title,
            body: this.props.body,
            category: this.props.category,
            status: this.props.status
        };
    }
}
