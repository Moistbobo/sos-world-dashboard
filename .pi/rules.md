# Project Rules for Agents

## Community Sentiment Feature Flag

The community sentiment section is gated by the `VITE_ENABLE_COMMUNITY_SENTIMENT` environment variable.

- The variable must be present in `.env.example` and documented in `CONTRIBUTING.md`.
- The `SentimentSection` component itself does **not** read this variable and is always mountable.
- The consumer (`WorldDetailPage` or any future parent) is responsible for conditionally rendering `SentimentSection` based on the flag.
- Before adding new sentiment UI, fetching sentiment data, or changing where `SentimentSection` is mounted, verify the flag check still gates the feature correctly.
- Do not fetch sentiment data (ratings/comments) unless the feature is enabled, to avoid unnecessary Supabase API calls and anonymous user creation.
