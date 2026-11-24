import { useEffect } from 'react';
import { toast as notify } from 'react-hot-toast';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    if (type === 'error') notify.error(message);
    else notify.success(message);
    onClose?.();
  }, [message, type]);

  return null;
}
