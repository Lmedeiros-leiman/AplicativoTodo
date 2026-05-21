import { TodoItemId } from "../value-objects/todo-item-id.js";

/** Ciclo de vida de um item: pendente -> concluido -> arquivado. */
export type TodoItemStatus = "pending" | "completed" | "archived";

/** Classificacao do item para organizacao. */
export type TodoItemCategory = "work" | "personal" | "other";

/** Dados de negocio compartilhados pelo estado interno e pelo snapshot publico. */
export type TodoItemData = {
    title: string;
    body: string;
    userName: string;
    test: string;
    category: TodoItemCategory;
    status: TodoItemStatus;
};

/** Estado interno completo do agregado. Nunca exposto diretamente. */
export type TodoItemProps = {
    id: TodoItemId;
} & TodoItemData;

/**
 * Props aceitas por {@link TodoItem.create}.
 *
 * `category` e `status` sao opcionais: o dominio aplica os defaults
 * (`personal` e `pending`, respectivamente).
 */
export type CreateTodoItemProps = {
    id: TodoItemId;
    test: string;
} & Pick<TodoItemData, "title" | "body" | "userName">
    & Partial<Pick<TodoItemData, "category" | "status">>;

/**
 * Representacao somente-leitura do estado do item.
 * Usada para cruzar fronteiras de camada (repositorio, controller, tRPC).
 */
export type TodoItemSnapshot = {
    id: string;
} & TodoItemData;

/**
 * Agregado raiz do dominio de tarefas.
 *
 * Toda mutacao passa pelos factory methods `create` ou `restore`.
 * O construtor privado impede instanciacao arbitraria.
 */
export class TodoItem {
    private constructor(private props: TodoItemProps) { }

    /**
     * Cria um novo item aplicando regras de negocio.
     *
     * - Faz trim em `title`, `body` e `userName`.
     * - Aplica defaults: `category = "personal"`, `status = "pending"`.
     *
     * @throws {Error} Se `title`, `body` ou `userName` ficarem vazios apos trim.
     */
    static create(props: CreateTodoItemProps): TodoItem {
        const title = props.title.trim();
        const body = props.body.trim();
        const userName = props.userName.trim();

        if (!title) {
            throw new Error("Title must not be empty");
        }

        if (!body) {
            throw new Error("Body must not be empty");
        }

        if (!userName) {
            throw new Error("User name must not be empty");
        }

        return new TodoItem({
            id: props.id,
            test: props.test,
            title,
            body,
            userName,
            category: props.category ?? "personal",
            status: props.status ?? "pending",
        } satisfies TodoItemProps);
    }

    /**
     * Reconstroi um item a partir de dados persistidos, sem validacao.
     * Usado exclusivamente pelo repositorio ao hidratar do banco.
     */
    static restore(props: TodoItemProps): TodoItem {
        return new TodoItem({ ...props });
    }

    /**
     * Retorna uma copia somente-leitura do estado atual.
     * E a unica forma de ler os dados internos do agregado.
     */
    toSnapshot(): Readonly<TodoItemSnapshot> {
        return {
            id: this.props.id.toString(),
            title: this.props.title,
            body: this.props.body,
            userName: this.props.userName,
            test: this.props.test,
            category: this.props.category,
            status: this.props.status,
        } satisfies TodoItemSnapshot;
    }
}
