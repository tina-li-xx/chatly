# Chatting Blog Publishing Calendar

Use this file to keep backlog posts spaced out instead of dropping a cluster of articles on the same day.

## Default cadence
- Publish at most 2 posts per week unless there is a deliberate launch cluster.
- Use a Tuesday/Friday rhythm for the backlog so the schedule stays predictable.
- Leave at least 2-3 days between closely related comparison posts.
- Mix formats across the week when possible: one comparison post plus one how-to or case-study post.

## Draft workflow
- New post files should start with `publicationStatus: "draft"` in the exported `BlogPost`.
- Draft posts can stay in `src/lib/blog-post-*.ts` and in the generated registry without appearing on the live blog.
- When a post is ready to auto-publish on a specific date, change `publicationStatus` to `"scheduled"` and set `publishedAt` and `updatedAt` to the target date.
- Use `publicationStatus: "published"` for posts that should be live immediately.
- Scheduled posts now go live automatically after their target time without a redeploy.

## Editorial rhythm
- Tuesday: comparison or alternatives post
- Friday: how-to, case study, or ecommerce workflow post
- Avoid publishing two comparison posts back to back unless one is clearly broader and the other is a direct competitor page
- If a week has only one post, keep the Tuesday slot and leave Friday open

## Publishing queue
| Target date | Post slug | Current status | Theme | Notes |
| --- | --- | --- | --- | --- |
| Wednesday 2026-04-08 | `chatting-vs-gorgias` | Scheduled in code | Ecommerce comparison | Keep separate from the broader support roundup. |
| Friday 2026-04-10 | `best-live-chat-software-customer-support` | Scheduled in code | Customer-support roundup | Publish after the Gorgias comparison so comparison posts are not stacked. |
| Tuesday 2026-04-14 | `zendesk-alternatives-small-teams` | Scheduled in code | Alternatives roundup | Good BOFU comparison slot after the broader customer-support piece. |
| Friday 2026-04-17 | `traffic-low-conversion` | Scheduled in code | Conversion diagnosis | Broad traffic-without-results piece that works across ecommerce, SaaS, and service sites. |
| Friday 2026-04-24 | `small-ecommerce-customer-support-workflow` | Scheduled in code | Ecommerce support workflow | Covers what small stores really automate versus what still needs human review. |
| Friday 2026-05-01 | `shopify-live-chat-growth-uses` | Scheduled in code | Shopify growth playbook | Reframes live chat as a conversion layer instead of just a support tool. |
| Friday 2026-05-08 | `live-chat-worth-it-small-business` | Draft in code | Small-business decision guide | Broader "is this actually worth it?" post for teams worried about workload and slow replies. |
| Friday 2026-05-15 | `what-is-live-chat-benefits` | Scheduled in code | Live chat explainer | Broader educational post on what live chat is, why it matters, and the main small-business benefits. |

## Open publishing slots
| Target date | Slot type | Suggested use | Notes |
| --- | --- | --- | --- |
| Tuesday 2026-04-21 | Comparison | Broader category roundup | Avoid another ecommerce-specific comparison here if `chatting-vs-gorgias` just shipped. |
| Tuesday 2026-04-28 | Comparison | Retargeting or alternatives post | Best for a bottom-funnel keyword. |
| Tuesday 2026-05-05 | Comparison | Direct competitor or category retargeting | Pair with the May 8 decision post without crowding the same theme. |
| Tuesday 2026-05-12 | Comparison | Support-platform or alternatives post | Keeps the Tuesday/Friday rhythm intact before the May 15 explainer. |

## How to use this
- Keep drafts in code with their target dates already set.
- Move a post from `draft` to `scheduled` when the content is approved and you want it to publish automatically.
- Add each new draft or scheduled post to the queue or the next open slot as soon as it is written.
- If two posts feel too similar, move one to the next Tuesday or Friday instead of publishing both in the same week.
- When a post goes live, mark it Published in this file or remove it from the queue.

## Template
| Target date | Post slug | Current status | Theme | Notes |
| --- | --- | --- | --- | --- |
| YYYY-MM-DD | `post-slug` | Draft / Scheduled / Published | Comparison / How-to / Case study | Add spacing notes or dependencies here. |
