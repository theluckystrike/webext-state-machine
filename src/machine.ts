/**
 * State Machine — Finite state machine with guards and side effects
 */
export interface StateTransition<S extends string, E extends string> {
    from: S; event: E; to: S;
    guard?: () => boolean | Promise<boolean>;
    action?: (context: Record<string, unknown>) => void | Promise<void>;
}

export interface MachineConfig<S extends string, E extends string> {
    initial: S;
    transitions: StateTransition<S, E>[];
    context?: Record<string, unknown>;
    persist?: boolean;
    storageKey?: string;
}

export class StateMachine<S extends string, E extends string> {
    private state: S;
    private transitions: StateTransition<S, E>[];
    private context: Record<string, unknown>;
    private listeners = new Set<(state: S, event: E) => void>();
    private persist: boolean;
    private storageKey: string;

    constructor(config: MachineConfig<S, E>) {
        this.state = config.initial;
        this.transitions = config.transitions;
        this.context = config.context || {};
        this.persist = config.persist || false;
        this.storageKey = config.storageKey || '__fsm_state__';
        if (this.persist) this.restore();
    }

    /** Get current state */
    get current(): S { return this.state; }

    /** Get context */
    getContext(): Record<string, unknown> { return { ...this.context }; }

    /** Update context */
    setContext(update: Record<string, unknown>): void { Object.assign(this.context, update); }

    /** Send an event */
    async send(event: E): Promise<boolean> {
        const transition = this.transitions.find((t) => t.from === this.state && t.event === event);
        if (!transition) return false;
        if (transition.guard && !(await transition.guard())) return false;
        const prev = this.state;
        this.state = transition.to;
        if (transition.action) await transition.action(this.context);
        this.listeners.forEach((fn) => fn(this.state, event));
        if (this.persist) this.save();
        return true;
    }

    /** Check if event is valid in current state */
    can(event: E): boolean { return this.transitions.some((t) => t.from === this.state && t.event === event); }

    /** Get available events */
    availableEvents(): E[] { return this.transitions.filter((t) => t.from === this.state).map((t) => t.event); }

    /** Listen for state changes */
    onChange(listener: (state: S, event: E) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /** Check if in a specific state */
    is(state: S): boolean { return this.state === state; }

    /** Reset to initial state */
    async reset(initial: S): Promise<void> { this.state = initial; if (this.persist) this.save(); }

    private async save(): Promise<void> {
        try { await chrome.storage.local.set({ [this.storageKey]: { state: this.state, context: this.context } }); } catch { }
    }

    private async restore(): Promise<void> {
        try {
            const result = await chrome.storage.local.get(this.storageKey);
            const data = result[this.storageKey] as { state: S; context: Record<string, unknown> } | undefined;
            if (data) { this.state = data.state; this.context = data.context; }
        } catch { }
    }
}
