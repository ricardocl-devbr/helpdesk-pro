import { toast } from 'sonner'

const DURATION = 4000

export const appToast = {
  success: (message: string) => toast.success(message, { duration: DURATION }),
  error: (message: string) => toast.error(message, { duration: DURATION }),
  info: (message: string) => toast.info(message, { duration: DURATION }),
  foreignKey: () =>
    toast.error('Cannot delete: this item has linked records. Remove them first.', {
      duration: DURATION,
    }),
  saving: () => toast.loading('Saving...', { duration: DURATION }),
}
