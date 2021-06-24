import { toast } from 'react-toastify'

const config = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined
}

const useAlert = () => {
  const alertSuccess = (message) => {
    toast.success(
      message,
      config
    )
  }

  const alertError = (message) => {
    toast.error(
      message,
      config
    )
  }

  const alertWarning = (message) => {
    toast.warn(
      message,
      config
    )
  }

  return { alertSuccess, alertError, alertWarning }
}

export default useAlert
