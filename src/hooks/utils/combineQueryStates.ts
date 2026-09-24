type QueryStateLike<TData, TError = unknown> = {
    data: TData | undefined;
    isPending: boolean;
    error?: TError | null;
};

export type CombinedQueryState<TData, TError = unknown> =
    | { status: 'pending' }
    | { status: 'error'; error: TError }
    | { status: 'ready'; data: TData };

export function combineQueryStates<
    TData extends Record<string, unknown>,
    TError = unknown,
>(queries: {
    [K in keyof TData]: QueryStateLike<TData[K], TError>;
}): CombinedQueryState<TData, TError> {
    const error = Object.values(queries).find((query) => query.error != null)?.error;

    if (error != null) {
        return {
            status: 'error',
            error: error,
        };
    }

    const hasPending = Object.values(queries).some((query) => query.isPending);

    if (hasPending) {
        return { status: 'pending' };
    }

    const data = {} as TData;

    (Object.keys(queries) as (keyof TData)[]).forEach((key) => {
        data[key] = queries[key].data as TData[typeof key];
    });

    return {
        status: 'ready',
        data,
    };
}
