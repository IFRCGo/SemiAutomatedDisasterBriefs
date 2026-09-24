import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AiSummaryStatus = 'idle' | 'loading' | 'success' | 'error';

type AiSummaryState = {
    status: AiSummaryStatus;
    summary: string | null;
    error: string | null;
};

type UseAiSummaryArgs = {
    key: number | string | null;
    enabled: boolean;
    text: string | null;
};

type AiSummaryCacheEntry = {
    summary: string;
    createdAt: number;
};

let sharedWorker: Worker | null = null;
const summaryCache = new Map<string, AiSummaryCacheEntry>();
let globalRequestId = 0;

const getWorker = () => {
    if (!sharedWorker) {
        sharedWorker = new Worker(new URL('./summarizer.worker.ts', import.meta.url), {
            type: 'module',
        });
    }

    return sharedWorker;
};

const resetWorker = () => {
    if (sharedWorker) {
        sharedWorker.terminate();
    }
    sharedWorker = null;
};

const hashText = (value: string) => {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 33) ^ value.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
};

const SUMMARY_TIMEOUT_MS = 120000;

export function useAiSummary({ key, enabled, text }: UseAiSummaryArgs) {
    const [{ status, summary, error }, setState] = useState<AiSummaryState>({
        status: 'idle',
        summary: null,
        error: null,
    });
    const activeRequestId = useRef<number | null>(null);
    const activeTimeoutId = useRef<number | null>(null);
    const lastText = useRef<string | null>(null);
    const lastKey = useRef<number | string | null>(null);
    const isMounted = useRef(true);

    const worker = useMemo(() => getWorker(), []);
    const cacheKey = useMemo(() => {
        if (key === null || !text) {
            return null;
        }
        return `${key}:${hashText(text)}`;
    }, [key, text]);

    const clearTimeoutRef = useCallback(() => {
        if (activeTimeoutId.current !== null) {
            window.clearTimeout(activeTimeoutId.current);
            activeTimeoutId.current = null;
        }
    }, []);

    const cancelActive = useCallback(() => {
        if (activeRequestId.current !== null) {
            worker.postMessage({ type: 'cancel', requestId: activeRequestId.current });
            activeRequestId.current = null;
        }
        clearTimeoutRef();
    }, [clearTimeoutRef, worker]);

    const reset = useCallback(() => {
        cancelActive();
        setState({ status: 'idle', summary: null, error: null });
    }, [cancelActive]);

    const startTimeout = useCallback(
        (requestId: number) => {
            clearTimeoutRef();
            activeTimeoutId.current = window.setTimeout(() => {
                if (activeRequestId.current === requestId) {
                    worker.postMessage({ type: 'cancel', requestId });
                    activeRequestId.current = null;
                    setState({ status: 'error', summary: null, error: 'Timed out' });
                }
            }, SUMMARY_TIMEOUT_MS);
        },
        [clearTimeoutRef, worker]
    );

    const startSummary = useCallback(
        (prompt: string, nextCacheKey: string | null) => {
            cancelActive();

            if (nextCacheKey) {
                const cached = summaryCache.get(nextCacheKey);
                if (cached) {
                    setState({ status: 'success', summary: cached.summary, error: null });
                    return;
                }
            }

            globalRequestId += 1;
            const requestId = globalRequestId;
            activeRequestId.current = requestId;

            setState({ status: 'loading', summary: null, error: null });

            startTimeout(requestId);

            worker.postMessage({ type: 'summarize', requestId, text: prompt });
        },
        [cancelActive, startTimeout, worker]
    );

    const regenerate = useCallback(() => {
        if (!text) {
            return;
        }
        if (cacheKey) {
            summaryCache.delete(cacheKey);
        }
        startSummary(text, cacheKey);
    }, [cacheKey, startSummary, text]);

    useEffect(() => {
        isMounted.current = true;

        const handleMessage = (event: MessageEvent) => {
            if (!isMounted.current) return;

            const { type, requestId, output, error: workerError } = event.data ?? {};

            if (!requestId || requestId !== activeRequestId.current) {
                return;
            }

            clearTimeoutRef();
            activeRequestId.current = null;

            if (type === 'complete') {
                if (cacheKey && output) {
                    summaryCache.set(cacheKey, { summary: output, createdAt: Date.now() });
                    if (summaryCache.size > 50) {
                        const entries = Array.from(summaryCache.entries());
                        const oldestEntries = entries.slice(0, entries.length - 50);
                        oldestEntries.forEach(([key]) => summaryCache.delete(key));
                    }
                }
                setState({ status: 'success', summary: output ?? null, error: null });
            } else if (type === 'error') {
                setState({ status: 'error', summary: null, error: workerError ?? 'Unknown error' });
            }
        };

        const handleWorkerError = () => {
            if (!isMounted.current) return;

            clearTimeoutRef();
            activeRequestId.current = null;
            resetWorker();
            setState({ status: 'error', summary: null, error: 'Worker failed' });
        };

        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleWorkerError);
        worker.addEventListener('messageerror', handleWorkerError);

        return () => {
            isMounted.current = false;
            worker.removeEventListener('message', handleMessage);
            worker.removeEventListener('error', handleWorkerError);
            worker.removeEventListener('messageerror', handleWorkerError);
        };
    }, [cacheKey, clearTimeoutRef, worker]);

    useEffect(() => {
        if (key !== lastKey.current) {
            reset();
            lastText.current = null;
            lastKey.current = key;
            return;
        }

        if (key === null || !enabled || !text) {
            return;
        }

        if (text === lastText.current) {
            if (status === 'success' || status === 'error') {
                return;
            }
            if (status === 'loading') {
                return;
            }
        }

        if (cacheKey) {
            const cached = summaryCache.get(cacheKey);
            if (cached) {
                cancelActive();
                setState({ status: 'success', summary: cached.summary, error: null });
                lastText.current = text;
                return;
            }
        }

        if (status !== 'loading') {
            lastText.current = text;
            startSummary(text, cacheKey);
        }
    }, [cacheKey, cancelActive, enabled, key, reset, startSummary, status, text]);

    useEffect(() => {
        return () => {
            cancelActive();
        };
    }, [cancelActive]);

    return { status, summary, error, regenerate, reset };
}
