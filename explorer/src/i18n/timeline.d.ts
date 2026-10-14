import "vis-timeline";

declare module "vis-timeline" {
  interface Timeline {
    // Native CustomTime supports a title callback; upstream types only list strings.
    setCustomTimeTitle(title: (date: Date) => string, id?: string | number): void;
  }
}
