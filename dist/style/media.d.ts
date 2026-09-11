/**
 * `$.media` — breakpoint reativo. Cria um signal<boolean> que reflete `matchMedia`
 * (aceita nome de breakpoint registrado, número, ou query crua), com cleanup no escopo.
 */
export declare function media(nameOrQuery: string): {
    readonly value: boolean;
};
