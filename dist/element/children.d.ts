/**
 * `appendChild` — normaliza qualquer filho renderizável e o injeta no pai:
 * primitivos → texto; Node → direto; array → recursivo; `[Component, props]` →
 * chama o componente; fonte reativa (signal|função) → região reativa.
 */
export declare function appendChild(parent: Node, child: unknown): void;
