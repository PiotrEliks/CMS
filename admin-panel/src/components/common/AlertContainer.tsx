import Alert from '../ui/alert/Alert'
import { useAlerts } from '../../store/alerts';

export default function AlertContainer() {
  const { alerts, removeAlert } = useAlerts();

  if (!alerts.length) return null;

  return (
    <div className="fixed z-[9999] top-20 right-4 flex flex-col gap-3 max-w-sm">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          showLink={false}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );
}
