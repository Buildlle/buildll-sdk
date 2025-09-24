import React from "react";
import { renderHook, waitFor, act, cleanup } from "@testing-library/react";
import { expect, test, vi, beforeEach, afterEach } from "vitest";

import { useContent } from "../src/hooks/useContent";
import { BuildllProvider } from "../src/provider/BuildllProvider";

/**
 * Mock buildll client
 * - tests import path must match how provider imports buildllClient
 */
const mockClient = {
  getContent: vi.fn(),
  updateContent: vi.fn(),
};

vi.mock("../src/client", () => ({
  buildllClient: () => mockClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

/**
 * Default wrapper (viewer mode)
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BuildllProvider siteId="test-site">{children}</BuildllProvider>
);

/**
 * Editor-mode wrapper
 */
const editorWrapper = ({ children }: { children: React.ReactNode }) => (
  <BuildllProvider siteId="test-site" editorMode={true}>
    {children}
  </BuildllProvider>
);

/* ---------------------------
   Tests
---------------------------- */

test("useContent returns defaults immediately and settles after fetch", async () => {
  // client will resolve with `null` (no content created yet)
  mockClient.getContent.mockResolvedValue(null);

  const defaults = { title: "Hello" };
  const { result } = renderHook(() => useContent("hero", { defaults }), { wrapper });

  // initial synchronous state: defaults are available and loading is true
  expect(result.current.data?.title).toBe("Hello");
  expect(result.current.isLoading).toBe(true);

  // wait for fetch to finish and isLoading to become false
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  // after settle, still show defaults (no remote data)
  expect(result.current.data?.title).toBe("Hello");
  expect(result.current.error).toBeNull();
});

test("useContent fetches remote content and returns it", async () => {
  const remote = { data: { title: "Fetched Title", subtitle: "Sub" } };
  mockClient.getContent.mockResolvedValue(remote);

  const { result } = renderHook(() => useContent("hero"), { wrapper });

  // wait for fetch to complete
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // should reflect remote data
  expect(result.current.data?.title).toBe("Fetched Title");
  expect(result.current.data?.subtitle).toBe("Sub");
  expect(result.current.error).toBeNull();
});

test("useContent works in editor mode (no editing functionality in SDK)", async () => {
  // initial remote content
  mockClient.getContent.mockResolvedValue({ data: { title: "Original" } });

  const { result } = renderHook(() => useContent("hero"), { wrapper: editorWrapper });

  // wait for fetch to complete
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.data?.title).toBe("Original");

  // updateContent should not be available in the SDK
  // Editing happens only in the dashboard via iframe communication
  expect(result.current.updateContent).toBeUndefined();
});

test("useContent works consistently in production mode", async () => {
  mockClient.getContent.mockResolvedValue({ data: { title: "Original" } });

  const { result } = renderHook(() => useContent("hero"), { wrapper });

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Content is fetched and displayed
  expect(result.current.data?.title).toBe("Original");

  // updateContent should be undefined - editing only happens in dashboard
  expect(result.current.updateContent).toBeUndefined();
});

test("useContent surfaces errors from the client", async () => {
  const err = new Error("Network failure");
  mockClient.getContent.mockRejectedValue(err);

  const { result } = renderHook(() => useContent("hero"), { wrapper });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.error).toBeDefined();
  expect(result.current.error).toEqual(err);
});
