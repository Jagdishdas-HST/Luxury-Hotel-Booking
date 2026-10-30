// Imported app: rendered in the browser only, so render() keeps the platform contract without running the app here; head tags come from index.html.
export function render(_url: string, _origin = "") {
  return { helmetContext: {} as Record<string, any> };
}
