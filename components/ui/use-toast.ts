"use client"

// This is a simplified version of the toast hook
import { useState } from "react"

type ToastProps = {
  title: string
  description: string
}

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null)

  const showToast = (props: ToastProps) => {
    setToast(props)

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  return {
    toast: showToast,
    currentToast: toast,
    dismiss: () => setToast(null),
  }
}

export const toast = (props: ToastProps) => useToast().toast(props)
