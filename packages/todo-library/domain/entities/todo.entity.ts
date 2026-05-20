


export type TodoItemStatus = 'pending' | 'completed';

export type TodoItemCategory = 'work' | 'personal' | 'other';


export type TodoItemProps = {
    title: string;
    body: string;
    category: TodoItemCategory;
    status: TodoItemStatus;
};

export type CreateTodoItemProps = {
    title: string;
    body: string;
    category?: TodoItemCategory;
    status?: TodoItemStatus;
};


export class TodoItem {
    private constructor(private readonly props: CreateTodoItemProps) { }

    get title() {
        return this.props.title;
    }

    get body() {
        return this.props.body;
    }

    get category() {
        return this.props.category;
    }

    get status() {
        return this.props.status;
    }

    static create(props: CreateTodoItemProps) {
        const title = props.title.trim();
        const body = props.body.trim();

        if (!title) {
            throw new Error("Title must not be empty");
        }

        if (!body) {
            throw new Error("Body must not be empty");
        }

        return new TodoItem({
            title,
            body,
            category: props.category ?? "personal",
            status: props.status ?? "pending"
        });
    }

    static restore(props: TodoItemProps) {
        return new TodoItem(props);
    }
}
