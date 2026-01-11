# Notifications delivery

## Types
- In-app (bell)
- Push (mobile)
- Email (optional)

## Events
- new DM message (purple)
- new mailbox message (red)
- comment/reply to post
- moderation actions (warn/mute/ban)
- system announcements

## Delivery design
- Write notification docs `notifications/{uid}/items/{id}`.
- Client subscribes and displays.
- Push fanout via Functions (FCM) when enabled.
