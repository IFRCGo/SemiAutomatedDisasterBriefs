const DEFAULT_ERROR_MESSAGE = 'Request failed';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === 'object';

const getStringFromArray = (value: unknown): string | undefined => {
    if (!Array.isArray(value)) {
        return undefined;
    }

    return value.find((item): item is string => typeof item === 'string');
};

const getFirstStringFromErrorsRecord = (value: unknown): string | undefined => {
    if (!isRecord(value)) {
        return undefined;
    }

    for (const fieldValue of Object.values(value)) {
        if (typeof fieldValue === 'string') {
            return fieldValue;
        }

        const fromArray = getStringFromArray(fieldValue);
        if (fromArray) {
            return fromArray;
        }
    }

    return undefined;
};

export function getApiErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    }

    if (!isRecord(error)) {
        return DEFAULT_ERROR_MESSAGE;
    }

    const errors = error.errors;
    const nonFieldError = isRecord(errors)
        ? getStringFromArray(errors.non_field_errors)
        : undefined;
    if (nonFieldError) {
        return nonFieldError;
    }

    const errorsRecordMessage = getFirstStringFromErrorsRecord(errors);
    if (errorsRecordMessage) {
        return errorsRecordMessage;
    }

    if (typeof error.detail === 'string') {
        return error.detail;
    }

    if (typeof error.message === 'string') {
        return error.message;
    }

    if (typeof error.error === 'string') {
        return error.error;
    }

    return DEFAULT_ERROR_MESSAGE;
}
