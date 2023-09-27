import { CancelTokenSource } from 'axios';
import { defineStore } from 'pinia';

export interface HttpRequest {
  id: string;
  cancelTokenSource: CancelTokenSource;
}

export const useHttpStore = defineStore('http', {
  state: () => ({
    requests: [] as HttpRequest[],
  }),
  actions: {
    addRequest(request: HttpRequest) {
      this.requests.push(request);
    },
    removeRequest(requestId: string) {
      const requestIndex = this.requests.findIndex(({ id }) => id === requestId);
      if (requestIndex >= 0) {
        this.requests.splice(requestIndex, 1);
      }
    },
    cancelAllRequests(reason?: string) {
      this.requests.forEach(({ id, cancelTokenSource }) => {
        cancelTokenSource.cancel(reason);
        this.removeRequest(id);
      });
    },
  },
});
