import { create } from 'zustand';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export type AlertPayload = {
  variant: AlertVariant;
  title: string;
  message: string;
  duration?: number;
};

export type AlertInstance = AlertPayload & {
  id: string;
};

type AlertsState = {
  alerts: AlertInstance[];
  showAlert: (alert: AlertPayload) => void;
  removeAlert: (id: string) => void;
};

export const useAlerts = create<AlertsState>((set) => ({
  alerts: [],
  showAlert: (alert) => {
    const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());

    const instance: AlertInstance = {
      id,
      ...alert,
    };

    set((state) => ({
      alerts: [...state.alerts, instance],
    }));

    if (alert.duration && alert.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }));
      }, alert.duration);
    }
  },
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
}));
