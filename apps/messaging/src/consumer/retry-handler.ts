export class RetryHandler {
  async executeRetry(
    attempt: number,
    maxAttempts: number,
    baseDelayMs: number,
    maxDelayMs: number,
  ): Promise<void> {
    const delay = this.calculateBackoffDelay(attempt, baseDelayMs, maxDelayMs);
    console.log(
      `[CONSUMER] [RETRY] Attempt ${attempt}/${maxAttempts} failed, waiting ${delay}ms before retry...`,
    );
    await this.sleep(delay);
  }

  shouldRetry(attempt: number, maxAttempts: number): boolean {
    return attempt < maxAttempts;
  }

  private calculateBackoffDelay(
    attempt: number,
    baseDelayMs: number,
    maxDelayMs: number,
  ): number {
    return Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
