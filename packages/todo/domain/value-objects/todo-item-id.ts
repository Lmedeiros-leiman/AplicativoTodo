export class TodoItemId {
    private constructor(private readonly value: string) { }

    static create(value: string): TodoItemId {
        const normalized = value.trim();

        if (!normalized) {
            throw new Error("TodoItemId must not be empty");
        }

        return new TodoItemId(normalized);
    }

    toString(): string {
        return this.value;
    }

    equals(other: TodoItemId): boolean {
        return this.value === other.value;
    }
}
