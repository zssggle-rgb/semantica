import { uiText } from "../../i18n";
import type { FocusedUnavailableReason, GroupedViewUnavailableReason } from "./types";

const GROUPED_VIEW_COPY = {
  "communities-undetected": uiText("Grouped view is unavailable until communities can be detected."),
  "community-nodes-missing": uiText("Grouped view is unavailable because no community nodes could be created."),
} as const;

const FOCUSED_MODE_COPY = {
  "no-selection": uiText("Select a node to inspect in Focused mode."),
  "grouped-unresolvable": uiText("Focused mode is unavailable for this grouped selection."),
  "not-in-graph": uiText("Selected item is not available in the current graph."),
} as const;

export function groupedViewReasonText(
  reason: GroupedViewUnavailableReason | null | undefined,
): string | null {
  if (!reason) {
    return null;
  }

  switch (reason.code) {
    case "communities-undetected":
      return GROUPED_VIEW_COPY["communities-undetected"];
    case "community-nodes-missing":
      return GROUPED_VIEW_COPY["community-nodes-missing"];
    case "invalid-community-layout":
      return uiText("Grouped node {{v0}} has invalid coordinates.", { v0: (reason.nodeId) });
    case "missing-grouped-node":
      return uiText("Grouped edge {{v0}} references a missing grouped node.", { v0: (reason.edgeId) });
  }
}

export function focusedUnavailableReasonText(
  reason: FocusedUnavailableReason | null | undefined,
): string | null {
  if (!reason) {
    return null;
  }

  return FOCUSED_MODE_COPY[reason.code];
}
