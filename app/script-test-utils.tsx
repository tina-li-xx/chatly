import { createMockReactHooks } from "./dashboard/test-react-hooks";

export async function loadRemoteScriptModule(modulePath: string, hostname: string, testId: string) {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const script = vi.fn();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/script", () => ({
    default: (props: Record<string, unknown>) => ((script(props), <script data-testid={testId} />))
  }));
  vi.stubGlobal("window", { location: { hostname } });

  const module = await import(modulePath);
  return { Component: module.default, reactMocks, script };
}
