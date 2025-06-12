

/**
 * Protocard = a portrait orientation card. Has rules text on it to indicate how it behaves, esp. when interacted
 *   Might store other cards, but is a leaf in the tree of interactable objects.
 * 
 * Compare and contrast: other card shaped things, like
 *   zones (can host cards which can be interacted with),
 *   recursive subgames (can host zones and sub interactions)
 */
export type ProtocardContent = {
    textBody: string;
}