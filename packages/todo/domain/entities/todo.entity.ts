import { TodoItemId } from "../value-objects/todo-item-id.js";

export type TodoItemStatus = "pending" | "completed" | "archived";

export type TodoItemCategory = "work" | "personal" | "other";

export type TodoItemProps = {
    id: TodoItemId;
    title: string;
    body: string;
    category: TodoItemCategory;
    status: TodoItemStatus;
};

export type CreateTodoItemProps = {
    id: TodoItemId;
    title: string;
    body: string;
    category?: TodoItemCategory;
    status?: TodoItemStatus;
};

export type TodoItemSnapshot = {
    id: string;
    title: string;
    body: string;
    category: TodoItemCategory;
    status: TodoItemStatus;
};

export class TodoItem {
    private constructor(private props: TodoItemProps) { }

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

    static restore(props: TodoItemProps): TodoItem {
        return new TodoItem({ ...props });
    }

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
