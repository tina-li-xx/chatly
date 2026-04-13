import { parseBingRssResults, parseDuckDuckGoHtmlResults, parseSearxngJsonResults } from "@/lib/chatting-seo-live-research-service";

describe("chatting seo live research service", () => {
  it("parses SearXNG JSON results into ranked search results", () => {
    const results = parseSearxngJsonResults({
      results: [
        {
          title: "Best website chat widget for small teams",
          url: "https://usechatting.com/blog/best-website-chat-widget",
          content: "Chatting helps small teams talk to visitors faster."
        },
        {
          title: "Intercom Alternative for Lean Teams",
          url: "https://example.com/intercom-alternative",
          content: "Compare tools and pricing."
        }
      ]
    }, 5);

    expect(results).toEqual([
      {
        rank: 1,
        title: "Best website chat widget for small teams",
        url: "https://usechatting.com/blog/best-website-chat-widget",
        domain: "usechatting.com",
        snippet: "Chatting helps small teams talk to visitors faster."
      },
      {
        rank: 2,
        title: "Intercom Alternative for Lean Teams",
        url: "https://example.com/intercom-alternative",
        domain: "example.com",
        snippet: "Compare tools and pricing."
      }
    ]);
  });

  it("parses Bing RSS items into ranked search results", () => {
    const results = parseBingRssResults(
      `<?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <title><![CDATA[Best website chat widget for small teams]]></title>
            <link>https://usechatting.com/blog/best-website-chat-widget</link>
            <description><![CDATA[Chatting helps small teams talk to visitors faster.]]></description>
          </item>
          <item>
            <title>Intercom Alternative for Lean Teams</title>
            <link>https://example.com/intercom-alternative</link>
            <description>Compare tools &amp; pricing.</description>
          </item>
        </channel>
      </rss>`,
      5
    );

    expect(results).toEqual([
      {
        rank: 1,
        title: "Best website chat widget for small teams",
        url: "https://usechatting.com/blog/best-website-chat-widget",
        domain: "usechatting.com",
        snippet: "Chatting helps small teams talk to visitors faster."
      },
      {
        rank: 2,
        title: "Intercom Alternative for Lean Teams",
        url: "https://example.com/intercom-alternative",
        domain: "example.com",
        snippet: "Compare tools & pricing."
      }
    ]);
  });

  it("parses DuckDuckGo HTML items into ranked search results", () => {
    const results = parseDuckDuckGoHtmlResults(
      `<html>
        <body>
          <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fusechatting.com%2Fblog%2Fshared-inbox">Shared inbox for website chat</a>
          <a class="result__snippet">Chatting helps small teams manage conversations in one place.</a>
          <a class="result__a" href="https://example.com/live-chat-routing">Live chat routing rules</a>
          <div class="result__snippet">Routing, saved replies, and visitor context.</div>
        </body>
      </html>`,
      5
    );

    expect(results).toEqual([
      {
        rank: 1,
        title: "Shared inbox for website chat",
        url: "https://usechatting.com/blog/shared-inbox",
        domain: "usechatting.com",
        snippet: "Chatting helps small teams manage conversations in one place."
      },
      {
        rank: 2,
        title: "Live chat routing rules",
        url: "https://example.com/live-chat-routing",
        domain: "example.com",
        snippet: "Routing, saved replies, and visitor context."
      }
    ]);
  });
});
