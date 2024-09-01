import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: sessionStorage.getItem('token'),
  }),
  actions: {
    login(token: string) {
      this.token = token;
      sessionStorage.setItem('token', this.token)
    },
    logout() {
      this.token = null;
      sessionStorage.removeItem('token')
    },
  },
});
