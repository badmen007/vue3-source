const queue = [];
let isFlushing = false;
const resolvePromise = Promise.resolve();

export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlushing) {
    isFlushing = true;
    resolvePromise.then(() => {
      isFlushing = false;

      let arr = queue.slice(0);
      queue.length = 0;

      for (let i = 0; i < arr.length; i++) {
        const job = arr[i];
        job();
      }
      arr.length = 0;
    });
  }
}
