import { useCallback, useContext, useMemo, useState } from 'react';
import type { AlertContextProps, AlertParams } from '@ifrc-go/ui/contexts';
import { AlertContext } from '@ifrc-go/ui/contexts';

interface AlertProviderProps {
    children: React.ReactNode;
}

const DEFAULT_DURATION = 5000;
const DEFAULT_VARIANT: AlertParams['variant'] = 'danger';

export type AlertContextValue = AlertContextProps & {
    show: (name: string, title: AlertParams['title'], description: string) => string;
};

export function useAlert(): AlertContextValue {
    return useContext(AlertContext) as AlertContextValue;
}

export function AlertProvider({ children }: AlertProviderProps): JSX.Element {
    const [alerts, setAlerts] = useState<AlertParams[]>([]);

    const addAlert = useCallback((alert: AlertParams) => {
        setAlerts((prevAlerts) => [...prevAlerts, alert]);
    }, []);

    const removeAlert = useCallback((name: string) => {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.name !== name));
    }, []);

    const updateAlert = useCallback((name: string, params: Omit<AlertParams, 'name'>) => {
        setAlerts((prevAlerts) =>
            prevAlerts.map((alert) =>
                alert.name === name
                    ? {
                          ...alert,
                          ...params,
                      }
                    : alert
            )
        );
    }, []);

    const show = useCallback((name: string, title: AlertParams['title'], description: string) => {
        const nextAlert: AlertParams = {
            name,
            title,
            description,
            duration: DEFAULT_DURATION,
            variant: DEFAULT_VARIANT,
        };

        setAlerts((prevAlerts) => {
            const hasAlert = prevAlerts.some((alert) => alert.name === name);
            if (!hasAlert) {
                return [...prevAlerts, nextAlert];
            }

            return prevAlerts.map((alert) => (alert.name === name ? nextAlert : alert));
        });

        return name;
    }, []);

    const alertContextValue = useMemo<AlertContextValue>(
        () => ({
            alerts,
            addAlert,
            removeAlert,
            updateAlert,
            show,
        }),
        [alerts, addAlert, removeAlert, updateAlert, show]
    );

    return <AlertContext.Provider value={alertContextValue}>{children}</AlertContext.Provider>;
}
