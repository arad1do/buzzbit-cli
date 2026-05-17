// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-17T08:42:26.828Z
//
// Each export is the array of values from a `z.enum(IDENTIFIER)` reference
// resolved by walking imports back to the server source file. Use these in
// hand-tuned commands under src/commands/ to keep --help text in sync with
// what the server actually accepts.

export const CHATFLOW_TRIGGER_VALUES = [
  "any_message",
  "cart_abandoned",
  "facebook_message",
  "facebook_new_follower",
  "first_purchase",
  "instagram_comment",
  "instagram_dm",
  "instagram_new_follower",
  "instagram_story_reply",
  "order_placed",
  "whatsapp_message",
  "whatsapp_first_message",
  "whatsapp_keyword",
  "keyword_match",
  "shopify_order_created",
  "shopify_order_cancelled",
  "shopify_order_fulfilled",
  "shopify_cart_abandoned",
  "shopify_checkout_abandoned",
  "shopify_customer_created",
  "shopify_price_drop",
  "shopify_back_in_stock",
  "shopify_refund_created"
] as const;
export type CHATFLOW_TRIGGERValue = (typeof CHATFLOW_TRIGGER_VALUES)[number];

export const FLOW_TRIGGER_VALUES = [
  "order_placed",
  "order_cancelled",
  "order_fulfilled",
  "order_paid",
  "order_updated",
  "customer_created",
  "customer_updated",
  "customer_inactive",
  "customer_lapsed",
  "customer_birthday",
  "cart_abandoned",
  "checkout_abandoned",
  "browse_abandoned",
  "new_subscriber",
  "product_price_drop",
  "product_low_inventory",
  "product_back_in_stock",
  "product_created",
  "product_updated",
  "product_deleted",
  "product_viewed",
  "refund_created",
  "fulfillment_created",
  "fulfillment_updated",
  "vip_achieved",
  "email_opened",
  "email_clicked",
  "email_bounced",
  "email_unsubscribed",
  "email_complained",
  "custom_event",
  "manual",
  "segment_entered",
  "segment_exited",
  "whatsapp_message_received",
  "instagram_comment_received",
  "instagram_dm_received",
  "instagram_story_reply_received",
  "instagram_follow_received",
  "facebook_message_received",
  "facebook_follow_received",
  "sunset",
  "winback",
  "birthday",
  "BROWSE_ABANDONED",
  "VIP_ACHIEVED",
  "viewed_product",
  "SOCIAL_COMMENT",
  "instagram_comment",
  "instagram_story_reply",
  "instagram_follow"
] as const;
export type FLOW_TRIGGERValue = (typeof FLOW_TRIGGER_VALUES)[number];
