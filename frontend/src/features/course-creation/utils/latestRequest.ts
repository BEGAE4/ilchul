export class LatestRequestGate {
  private sequence = 0;
  private controller?: AbortController;

  begin() {
    this.cancel();
    const sequence = this.sequence;
    const controller = new AbortController();
    this.controller = controller;
    return {
      signal: controller.signal,
      isCurrent: () => sequence === this.sequence && !controller.signal.aborted,
    };
  }

  cancel() {
    this.controller?.abort();
    this.sequence += 1;
  }
}
