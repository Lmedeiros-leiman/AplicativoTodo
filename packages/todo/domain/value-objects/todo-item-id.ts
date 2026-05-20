/**
 * Value object que representa o identificador único de um TodoItem.
 *
 * Encapsula a string bruta e garante que ela não seja vazia.
 * Dois ids com o mesmo valor são considerados iguais.
 */
export class TodoItemId {
    private constructor(private readonly value: string) { }

    /**
     * Cria um novo TodoItemId a partir de uma string.
     *
     * @param value - Qualquer string não-vazia (ex: UUID, slug, nanoid).
     * @throws {Error} Se o valor for vazio após trim.
     */
    static create(value: string): TodoItemId {
        const normalized = value.trim();

        if (!normalized) {
            throw new Error("TodoItemId must not be empty");
        }

        return new TodoItemId(normalized);
    }

    /** Retorna o valor primitivo da string. */
    toString(): string {
        return this.value;
    }

    /**
     * Compara dois ids por valor.
     *
     * @param other - O outro id a comparar.
     */
    equals(other: TodoItemId): boolean {
        return this.value === other.value;
    }
}
