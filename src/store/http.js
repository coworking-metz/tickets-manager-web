import { defineStore } from 'pinia';

export const useHttpStore = defineStore('http', {
  state: () => ({
    requests: [],
  }),
  actions: {
    addRequest(request) {
      this.requests.push(request);
    },
    removeRequest(requestId) {
      const requestIndex = this.requests.findIndex(({ id }) => id === requestId);
      if (requestIndex >= 0) {
        this.requests.splice(requestIndex, 1);
      }
    },
    cancelAllRequests(reason) {
      this.requests.forEach(({ id, cancelTokenSource }) => {
        cancelTokenSource.cancel(reason);
        this.removeRequest(id);
      });
    },
  },
});
