import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { trpc } from "./trpc";
import { idbGetAll, idbAdd, idbUpdateStatus, idbDelete } from "./db";
import "./App.css";

type Filter = "all" | "pending" | "completed" | "archived";
type Category = "work" | "personal" | "other";
type TodoStatus = "pending" | "completed" | "archived";

type TodoDto = {
    id: string;
    title: string;
    body: string;
    category: Category;
    status: TodoStatus;
};

const FILTERS: Filter[] = ["all", "pending", "completed", "archived"];
const CATEGORIES: Category[] = ["personal", "work", "other"];

const FILTER_LABELS: Record<Filter, string> = {
    all: "Tudo",
    pending: "Pendentes",
    completed: "Concluidas",
    archived: "Arquivo",
};

const STATUS_LABELS: Record<TodoStatus, string> = {
    pending: "pending",
    completed: "completed",
    archived: "archived",
};

const EMPTY_STATE: Record<Filter, { title: string; body: string }> = {
    all: {
        title: "Lista vazia",
        body: "Crie uma nota para iniciar o trabalho local.",
    },
    pending: {
        title: "Sem pendencias",
        body: "Itens concluidos ou arquivados ficam fora deste filtro.",
    },
    completed: {
        title: "Nada concluido",
        body: "Conclua uma tarefa para ela aparecer aqui.",
    },
    archived: {
        title: "Arquivo vazio",
        body: "Itens arquivados aparecem aqui para recuperacao.",
    },
};

function toDto(dto: { id: string; title: string; body: string; category: Category; status: TodoStatus }): TodoDto {
    return { id: dto.id, title: dto.title, body: dto.body, category: dto.category, status: dto.status };
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Erro desconhecido";
}

export function App() {
    const [filter, setFilter] = useState<Filter>("all");
    const [showForm, setShowForm] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [syncNotice, setSyncNotice] = useState<string | null>(null);

    const [todos, setTodos] = useState<TodoDto[]>([]);
    const [idbLoaded, setIdbLoaded] = useState(false);
    const [serverSynced, setServerSynced] = useState(false);
    const [orderedIds, setOrderedIds] = useState<string[]>([]);

    useEffect(() => {
        idbGetAll()
            .then((records) => {
                setTodos(
                    records.map((record) => ({
                        id: record.referenceId,
                        title: record.title,
                        body: record.body,
                        category: record.category,
                        status: record.status,
                    })),
                );
            })
            .catch((error: unknown) => {
                console.error(error);
                setLocalError(`Falha no armazenamento local: ${getErrorMessage(error)}`);
            })
            .finally(() => setIdbLoaded(true));
    }, []);

    const { data: serverTodos, error } = trpc.todos.list.useQuery(undefined, {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (!idbLoaded || !serverTodos || serverSynced) return;
        setServerSynced(true);

        setTodos((prev) => {
            const knownIds = new Set(prev.map((todo) => todo.id));
            const incoming = serverTodos.filter((todo) => !knownIds.has(todo.id));
            if (incoming.length === 0) return prev;

            incoming.forEach((todo) => {
                void idbAdd({
                    referenceId: todo.id,
                    title: todo.title,
                    body: todo.body,
                    category: todo.category,
                    status: todo.status,
                }).catch((error: unknown) => {
                    setLocalError(`Falha ao salvar item remoto localmente: ${getErrorMessage(error)}`);
                });
            });

            return [...prev, ...incoming.map(toDto)];
        });
    }, [idbLoaded, serverTodos, serverSynced]);

    useEffect(() => {
        setOrderedIds((prev) => {
            const currentSet = new Set(todos.map((todo) => todo.id));
            if (prev.length === 0) {
                return todos.map((todo) => todo.id).reverse();
            }
            const prevSet = new Set(prev);
            const newIds = todos.filter((todo) => !prevSet.has(todo.id)).map((todo) => todo.id);
            const existing = prev.filter((id) => currentSet.has(id));
            return [...newIds, ...existing];
        });
    }, [todos]);

    const createMutation = trpc.todos.create.useMutation();
    const markCompleted = trpc.todos.markCompleted.useMutation();
    const unmarkCompleted = trpc.todos.unmarkCompleted.useMutation();
    const archive = trpc.todos.archive.useMutation();
    const restore = trpc.todos.restore.useMutation();
    const deleteMutation = trpc.todos.delete.useMutation();

    const hasPendingWrites =
        createMutation.isPending ||
        markCompleted.isPending ||
        unmarkCompleted.isPending ||
        archive.isPending ||
        restore.isPending ||
        deleteMutation.isPending;

    const counts = useMemo(
        () =>
            todos.reduce<Record<Filter, number>>(
                (acc, todo) => {
                    acc.all += 1;
                    acc[todo.status] += 1;
                    return acc;
                },
                { all: 0, pending: 0, completed: 0, archived: 0 },
            ),
        [todos],
    );

    const todoMap = useMemo(() => new Map(todos.map((todo) => [todo.id, todo])), [todos]);

    const displayTodos = useMemo(
        () =>
            orderedIds
                .map((id) => todoMap.get(id))
                .filter((todo): todo is TodoDto => todo !== undefined)
                .filter((todo) => filter === "all" || todo.status === filter),
        [orderedIds, todoMap, filter],
    );

    const connectionState = !idbLoaded ? "loading" : error ? "error" : hasPendingWrites ? "syncing" : "ready";
    const connectionLabel =
        connectionState === "loading"
            ? "Carregando local"
            : connectionState === "error"
              ? "Servidor indisponivel"
              : connectionState === "syncing"
                ? "Sincronizando"
                : serverSynced
                  ? "Local pronto"
                  : "Local ativo";

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function reportSyncError(action: string, err: unknown) {
        setSyncNotice(`${action} ficou local. Servidor nao confirmou: ${getErrorMessage(err)}`);
    }

    function setTodoStatusLocal(id: string, status: TodoStatus) {
        void idbUpdateStatus(id, status).catch((error: unknown) => {
            setLocalError(`Falha ao atualizar armazenamento local: ${getErrorMessage(error)}`);
        });
        setTodos((prev) => prev.map((todo): TodoDto => (todo.id === id ? { ...todo, status } : todo)));
    }

    function removeTodoLocal(id: string) {
        void idbDelete(id).catch((error: unknown) => {
            setLocalError(`Falha ao excluir do armazenamento local: ${getErrorMessage(error)}`);
        });
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
        setOrderedIds((prev) => prev.filter((existingId) => existingId !== id));
    }

    function handleCreate(data: { title: string; body: string; category: Category }) {
        const title = data.title.trim();
        const body = data.body.trim() || title;
        const id = crypto.randomUUID();
        const created: TodoDto = { id, title, body, category: data.category, status: "pending" };

        setTodos((prev) => [created, ...prev]);
        setOrderedIds((prev) => [id, ...prev]);
        setShowForm(false);
        setSyncNotice(null);

        void idbAdd({
            referenceId: id,
            title,
            body,
            category: data.category,
            status: "pending",
        }).catch((error: unknown) => {
            setLocalError(`Falha ao salvar no dispositivo: ${getErrorMessage(error)}`);
        });

        createMutation.mutate(
            { id, title, body, category: data.category },
            {
                onSuccess: () => setSyncNotice(null),
                onError: (err) => reportSyncError("Criacao", err),
            },
        );
    }

    function handleToggleStatus(todo: TodoDto) {
        if (todo.status === "archived") return;
        const nextStatus: TodoStatus = todo.status === "completed" ? "pending" : "completed";
        setTodoStatusLocal(todo.id, nextStatus);
        const mutation = nextStatus === "completed" ? markCompleted : unmarkCompleted;

        mutation.mutate(todo.id, {
            onSuccess: () => setSyncNotice(null),
            onError: (err) => reportSyncError("Alteracao", err),
        });
    }

    function handleArchive(todo: TodoDto) {
        setTodoStatusLocal(todo.id, "archived");
        archive.mutate(todo.id, {
            onSuccess: () => setSyncNotice(null),
            onError: (err) => reportSyncError("Arquivamento", err),
        });
    }

    function handleRestore(todo: TodoDto) {
        setTodoStatusLocal(todo.id, "pending");
        restore.mutate(todo.id, {
            onSuccess: () => setSyncNotice(null),
            onError: (err) => reportSyncError("Restauracao", err),
        });
    }

    function handleDelete(todo: TodoDto) {
        removeTodoLocal(todo.id);
        deleteMutation.mutate(todo.id, {
            onSuccess: () => setSyncNotice(null),
            onError: (err) => reportSyncError("Exclusao", err),
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        setOrderedIds((prev) => {
            const oldIndex = prev.indexOf(active.id as string);
            const newIndex = prev.indexOf(over.id as string);
            if (oldIndex === -1 || newIndex === -1) return prev;
            return arrayMove(prev, oldIndex, newIndex);
        });
    }

    return (
        <div className="app">
            <main className="workspace" aria-busy={!idbLoaded || hasPendingWrites}>
                <header className="app-header">
                    <div className="brand-lockup">
                        <span className="product-label">MultiTodo</span>
                        <h1>Lista local</h1>
                    </div>
                    <div className="header-actions">
                        <span className={`sync-state sync-${connectionState}`} aria-live="polite">
                            {connectionLabel}
                        </span>
                        <button className="button button-primary" type="button" onClick={() => setShowForm((value) => !value)}>
                            {showForm ? "Fechar" : "Nova"}
                        </button>
                    </div>
                </header>

                {showForm && <CreateForm onSubmit={handleCreate} />}

                <nav className="filter-bar" aria-label="Filtros de status">
                    {FILTERS.map((item) => (
                        <button
                            key={item}
                            className={`segment${filter === item ? " is-active" : ""}`}
                            type="button"
                            onClick={() => setFilter(item)}
                            aria-pressed={filter === item}
                        >
                            <span>{FILTER_LABELS[item]}</span>
                            <span className="segment-count">{counts[item]}</span>
                        </button>
                    ))}
                </nav>

                <div className="alerts" aria-live="polite">
                    {localError && <p className="inline-alert alert-error">{localError}</p>}
                    {error && (
                        <p className="inline-alert alert-warning">
                            Dados locais continuam disponiveis. {error.message}
                        </p>
                    )}
                    {syncNotice && <p className="inline-alert alert-warning">{syncNotice}</p>}
                </div>

                <section className="list-shell" aria-label="Notas e tarefas">
                    {!idbLoaded ? (
                        <LoadingList />
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={(event) => setActiveId(event.active.id as string)}
                            onDragCancel={() => setActiveId(null)}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext
                                items={displayTodos.map((todo) => todo.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <ul className={`todo-list${activeId ? " is-drag-active" : ""}`}>
                                    {displayTodos.map((todo) => (
                                        <SortableTodoItem
                                            key={todo.id}
                                            todo={todo}
                                            onToggle={() => handleToggleStatus(todo)}
                                            onArchive={() => handleArchive(todo)}
                                            onRestore={() => handleRestore(todo)}
                                            onDelete={() => handleDelete(todo)}
                                        />
                                    ))}
                                    {displayTodos.length === 0 && <EmptyState filter={filter} />}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    )}
                </section>
            </main>
        </div>
    );
}

type TodoItemHandlers = {
    todo: TodoDto;
    onToggle: () => void;
    onArchive: () => void;
    onRestore: () => void;
    onDelete: () => void;
};

function SortableTodoItem({ todo, onToggle, onArchive, onRestore, onDelete }: TodoItemHandlers) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: todo.id,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform) || undefined,
        transition: transition ?? undefined,
    };
    const isArchived = todo.status === "archived";
    const canShowBody = todo.body.trim().length > 0 && todo.body.trim() !== todo.title.trim();

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`task-row status-${todo.status}${isDragging ? " is-dragging" : ""}`}
        >
            <button className="drag-handle" type="button" aria-label="Reordenar" {...attributes} {...listeners} />

            <article className="task-card" aria-label={todo.title}>
                <div className="task-topline">
                    <button
                        className={`status-control status-control-${todo.status}`}
                        type="button"
                        aria-label={todo.status === "completed" ? "Reabrir item" : "Concluir item"}
                        aria-pressed={todo.status === "completed"}
                        onClick={onToggle}
                        disabled={isArchived}
                    >
                        <span aria-hidden="true" />
                    </button>

                    <div className="task-copy">
                        <div className="task-title-row">
                            <strong className="task-title">{todo.title}</strong>
                            <span className={`state-badge state-${todo.status}`}>{STATUS_LABELS[todo.status]}</span>
                            <span className={`category-badge category-${todo.category}`}>{todo.category}</span>
                        </div>
                        {canShowBody && <p className="task-body">{todo.body}</p>}
                    </div>
                </div>

                <div className="task-actions" aria-label="Acoes do item">
                    {!isArchived && (
                        <button className="text-action" type="button" onClick={onToggle}>
                            {todo.status === "completed" ? "Reabrir" : "Concluir"}
                        </button>
                    )}
                    {isArchived ? (
                        <button className="text-action" type="button" onClick={onRestore}>
                            Restaurar
                        </button>
                    ) : (
                        <button className="text-action" type="button" onClick={onArchive}>
                            Arquivar
                        </button>
                    )}
                    <button className="text-action danger-action" type="button" onClick={onDelete}>
                        Excluir
                    </button>
                </div>
            </article>
        </li>
    );
}

function CreateForm({
    onSubmit,
}: {
    onSubmit: (data: { title: string; body: string; category: Category }) => void;
}) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [category, setCategory] = useState<Category>("personal");
    const canSubmit = title.trim().length > 0;

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canSubmit) return;
        onSubmit({ title: title.trim(), body: body.trim(), category });
        setTitle("");
        setBody("");
        setCategory("personal");
    }

    return (
        <form className="create-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="todo-title">
                Titulo
            </label>
            <input
                id="todo-title"
                className="field title-field"
                type="text"
                placeholder="Capturar nota ou tarefa"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                autoFocus
            />

            <label className="visually-hidden" htmlFor="todo-body">
                Detalhe
            </label>
            <textarea
                id="todo-body"
                className="field detail-field"
                placeholder="Detalhe opcional"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={3}
            />

            <div className="create-footer">
                <div className="category-picker" aria-label="Categoria">
                    {CATEGORIES.map((item) => (
                        <button
                            key={item}
                            className={`category-option category-${item}${category === item ? " is-selected" : ""}`}
                            type="button"
                            onClick={() => setCategory(item)}
                            aria-pressed={category === item}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <button className="button button-primary" type="submit" disabled={!canSubmit}>
                    Criar
                </button>
            </div>
        </form>
    );
}

function LoadingList() {
    return (
        <ul className="todo-list loading-list" aria-label="Carregando notas">
            {Array.from({ length: 4 }, (_, index) => (
                <li className="task-row skeleton-row" key={index}>
                    <span className="skeleton-drag" />
                    <div className="task-card">
                        <span className="skeleton-line skeleton-title" />
                        <span className="skeleton-line skeleton-body" />
                    </div>
                </li>
            ))}
        </ul>
    );
}

function EmptyState({ filter }: { filter: Filter }) {
    const empty = EMPTY_STATE[filter];

    return (
        <li className="empty-state">
            <strong>{empty.title}</strong>
            <span>{empty.body}</span>
        </li>
    );
}
