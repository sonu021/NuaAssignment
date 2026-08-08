import { fetchWithRetry } from "../../utils/fetchWithRetry";

/**
 * Race Condition State Manager Simulator
 * Replicates the exact sequence tracking logic used in ProductListScreen
 */
class SearchStateSimulator {
  public products: string[] = [];
  public currentQuery = "";
  private requestId = 0;

  async handleSearch(
    query: string,
    mockApiFetch: (q: string, signal?: AbortSignal) => Promise<string[]>,
  ) {
    // Increment request ID counter for every new query
    const thisRequestId = ++this.requestId;
    this.currentQuery = query;

    try {
      const results = await mockApiFetch(query);

      // RACE CONDITION GUARD: Discard response if request ID is no longer current
      if (thisRequestId !== this.requestId) {
        return { applied: false, reason: "superseded_by_newer_request" };
      }

      this.products = results;
      return { applied: true, data: results };
    } catch (err: any) {
      if (thisRequestId !== this.requestId) {
        return { applied: false, reason: "superseded_error_ignored" };
      }
      throw err;
    }
  }

  getLatestRequestId() {
    return this.requestId;
  }
}

describe("Search Race Condition Fix", () => {
  it("should discard slow out-of-order responses and keep latest search query results", async () => {
    const simulator = new SearchStateSimulator();

    // Mock API with artificial delays:
    // Request 1 ("iphone") is SLOW (takes 200ms)
    // Request 2 ("macbook") is FAST (takes 30ms)
    const mockApiFetch = (query: string): Promise<string[]> => {
      return new Promise((resolve) => {
        const delay = query === "iphone" ? 200 : 30;
        setTimeout(() => {
          resolve([`Result for ${query}`]);
        }, delay);
      });
    };

    // User types "iphone" (Request #1)
    const req1Promise = simulator.handleSearch("iphone", mockApiFetch);

    // Fast-typing user immediately changes query to "macbook" (Request #2)
    const req2Promise = simulator.handleSearch("macbook", mockApiFetch);

    // Wait for both promises to resolve
    const [res1, res2] = await Promise.all([req1Promise, req2Promise]);

    // Request #1 finishes second, but MUST be discarded
    expect(res1.applied).toBe(false);
    expect(res1.reason).toBe("superseded_by_newer_request");

    // Request #2 finishes first, and MUST be applied
    expect(res2.applied).toBe(true);
    expect(res2.data).toEqual(["Result for macbook"]);

    // Final state must reflect the latest query ("macbook"), NOT the stale "iphone"
    expect(simulator.products).toEqual(["Result for macbook"]);
  });

  it("should handle 3 rapid keystrokes correctly without race condition leakage", async () => {
    const simulator = new SearchStateSimulator();

    const mockApiFetch = (query: string): Promise<string[]> => {
      return new Promise((resolve) => {
        // Reverse delay: earlier queries take longer
        const delays: Record<string, number> = {
          a: 300,
          ap: 150,
          app: 50,
        };
        setTimeout(() => {
          resolve([`Search:${query}`]);
        }, delays[query] || 50);
      });
    };

    const p1 = simulator.handleSearch("a", mockApiFetch);
    const p2 = simulator.handleSearch("ap", mockApiFetch);
    const p3 = simulator.handleSearch("app", mockApiFetch);

    await Promise.all([p1, p2, p3]);

    // Final active state MUST strictly be "app"
    expect(simulator.products).toEqual(["Search:app"]);
  });
});

describe("Exponential Backoff Fetch Retry Utility", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should retry on 500 server error and succeed when server recovers", async () => {
    let attempts = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        return Promise.resolve({
          ok: false,
          status: 503,
          statusText: "Service Unavailable",
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ status: "success" }),
      } as Response);
    });

    const response = await fetchWithRetry(
      "https://dummyjson.com/products",
      {},
      { maxRetries: 3, initialDelayMs: 10 },
    );

    expect(attempts).toBe(3);
    expect(response.ok).toBe(true);
  });
});
