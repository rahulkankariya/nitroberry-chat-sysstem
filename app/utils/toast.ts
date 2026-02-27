import { toast, ToastOptions } from "react-toastify";

const toastConfig: ToastOptions = {
  // Fixed typo from "bootom-right" to "bottom-right"
  position: "bottom-right", 
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  // Added theme: "dark" to match your Industrial Automation Platform UI
  theme: "dark", 
};

export const notify = {
  success: (msg: string) => toast.success(msg, toastConfig),
  error: (msg: string) => toast.error(msg, toastConfig),
  info: (msg: string) => toast.info(msg, toastConfig),
  // Added warning for industrial alerts
  warn: (msg: string) => toast.warn(msg, toastConfig), 
};