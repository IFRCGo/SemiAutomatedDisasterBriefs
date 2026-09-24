// @ts-expect-error - CDN import has no local type declarations
const { pipeline, env } = await import('https://unpkg.com/@huggingface/transformers@3.8.1');

env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = 'https://unpkg.com/@huggingface/transformers@3.8.1/dist/';

type SummarizerOutput = Array<{
    summary_text?: string;
    generated_text?: string;
}>;

type SummarizerFn = (
    input: string,
    options: Record<string, number | boolean>
) => Promise<SummarizerOutput>;

type SummarizerProgress = {
    status?: string;
    loaded?: number;
    total?: number;
    progress?: number;
};

class SummarizerPipeline {
    static task = 'text2text-generation';
    static model = 'Xenova/LaMini-Flan-T5-248M';
    static instance: SummarizerFn | null = null;

    static async getInstance(progress_callback?: (progress: SummarizerProgress) => void) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, {
                progress_callback,
                quantized: true,
            });
        }
        return this.instance;
    }
}

const cancelledRequests = new Set<number>();
type PendingRequest = {
    requestId: number;
    text: string;
};
const pending: PendingRequest[] = [];
let processing = false;

const processNext = async () => {
    if (processing) {
        return;
    }

    const next = pending.shift();
    if (!next) {
        return;
    }

    const { requestId, text } = next;
    if (cancelledRequests.has(requestId)) {
        cancelledRequests.delete(requestId);
        processNext();
        return;
    }

    processing = true;
    try {
        const summarizer = await SummarizerPipeline.getInstance();
        if (!summarizer) {
            throw new Error('Summarizer unavailable');
        }

        const cleanedText = `Task: Convert the following statistics into a natural 2-sentence narrative summary.
    Context: ${text.replace(/\s+/g, ' ').trim()}`;
        const output = await summarizer(cleanedText, {
            max_new_tokens: 120,
            num_beams: 2,
            repetition_penalty: 1.2,
            do_sample: false,
        });

        if (cancelledRequests.has(requestId)) {
            cancelledRequests.delete(requestId);
            return;
        }

        const result = output[0]?.generated_text || output[0]?.summary_text;

        if (!result) {
            throw new Error('AI output was empty or invalid');
        }

        self.postMessage({
            type: 'complete',
            requestId,
            output: result,
        });
    } catch (error: unknown) {
        if (cancelledRequests.has(requestId)) {
            cancelledRequests.delete(requestId);
            return;
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        self.postMessage({ type: 'error', requestId, error: message });
    } finally {
        processing = false;
        processNext();
    }
};

self.onmessage = async (event) => {
    const { type, requestId, text } = event.data ?? {};

    if (type === 'cancel' && typeof requestId === 'number') {
        cancelledRequests.add(requestId);
        if (pending.length) {
            for (let i = pending.length - 1; i >= 0; i -= 1) {
                if (pending[i]?.requestId === requestId) {
                    pending.splice(i, 1);
                    break;
                }
            }
        }
        return;
    }

    if (type !== 'summarize' || typeof requestId !== 'number') {
        return;
    }

    if (typeof text !== 'string') {
        self.postMessage({ type: 'error', requestId, error: 'No text provided' });
        return;
    }

    pending.push({ requestId, text });
    processNext();
};

export {};
