import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    visible: false,
    message: '',
    type: 'info' as 'info' | 'error',
  }),
  actions: {
    showInfo(msg: string) {
      this.message = msg
      this.type = 'info'
      this.visible = true
      setTimeout(() => (this.visible = false), 3000)
    },
    showError(msg: string) {
      this.message = msg
      this.type = 'error'
      this.visible = true
      setTimeout(() => (this.visible = false), 3500)
    },
  },
})
