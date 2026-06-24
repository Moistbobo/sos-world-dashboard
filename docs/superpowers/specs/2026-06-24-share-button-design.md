# Share Button Design Spec

## Goal

Add a one-click **Share** action to the dashboard that copies a world's direct VRChat URL (`world.vrchatUrl`) to the clipboard and shows a confirmation toast.

## Context

- Users want to grab a VRChat world link quickly from the dashboard.
- A share action should be reachable from both the world card and the world detail page.
- The ticket explicitly chooses **Approach A**: use the modern Clipboard API (`navigator.clipboard.writeText`) only, with success/error toasts. No legacy fallback.

## UX

### WorldCard
- Add a small icon-only **Share** button to the right of the existing **Open in VRChat** button.
- The button uses the `Share2` Lucide icon.
- Clicking it copies `world.vrchatUrl` to the clipboard.
- The click must stop propagation so the card's detail navigation is not triggered.

### WorldDetailPage
- Add a text+icon **Share** button next to **Open in VRChat**.
- Uses the same copy logic as the card.

### Toast feedback
- Success: "Link copied" (i18n key: `share.success`).
- Failure: "Could not copy link" (i18n key: `share.error`).
- Delivered by the `sonner` toast library.
- A `Toaster` provider is mounted near the app root.

## Architecture

- `ShareButton` component: accepts `world: World` and an optional `iconOnly?: boolean` prop. Encapsulates copy logic and toast messages.
- `App.tsx`: mounts `<Toaster />` once, outside the router so toasts overlay every page.
- `WorldCard.tsx`: imports and renders icon-only `ShareButton` alongside the VRChat link.
- `WorldDetailPage.tsx`: imports and renders full `ShareButton` in the action bar.
- i18n: add a `share` namespace with `share`, `success`, and `error` keys to both `en.json` and `ja.json`.

## Data flow

1. User clicks `ShareButton`.
2. `navigator.clipboard.writeText(world.vrchatUrl)` is awaited.
3. On resolve: `toast.success(t('share.success'))`.
4. On reject: `toast.error(t('share.error'))`.

## Out of scope

- Native Web Share API / mobile share sheet.
- QR codes, embeds, social network targets.
- Dashboard-internal link sharing.
- Analytics.
- Legacy `execCommand` clipboard fallback.

## Acceptance criteria

- [ ] Share button visible on every `WorldCard` next to "Open in VRChat".
- [ ] Share button visible on `WorldDetailPage` next to "Open in VRChat".
- [ ] Clicking either copies `world.vrchatUrl` to the clipboard.
- [ ] Success toast appears on copy success; error toast on failure.
- [ ] Card share button click does not navigate to the detail page.
- [ ] i18n strings present in `en.json` and `ja.json`.
- [ ] `sonner` added to project dependencies.
- [ ] Tests verify rendering and handler behavior in both components.
