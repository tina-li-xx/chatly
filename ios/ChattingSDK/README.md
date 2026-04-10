# ChattingSDK

Visitor-side iOS/macOS Swift Package for Chatting live chat.

## What v1 includes

- persistent visitor session storage
- site config and online-status reads
- create/resume conversation messages
- contact identify sync
- email capture
- visitor typing updates
- live SSE conversation events
- a lightweight SwiftUI wrapper target: `ChattingSDKUI`

## Install

### Local development

Add the local package from this repository:

`ios/ChattingSDK`

Then import:

```swift
import ChattingSDK
import ChattingSDKUI
```

### CocoaPods

```ruby
pod 'ChattingSDK'
```

If you only want the core networking/session layer without the SwiftUI wrapper:

```ruby
pod 'ChattingSDK/Core'
```

### Public Swift Package release

This package can now be consumed directly from the main Chatting repository because the repo root exposes a Swift package manifest that points at `ios/ChattingSDK`.

Example dependency:

```swift
.package(url: "https://github.com/codelinglabs/chatting.git", from: "1.0.0")
```

Then depend on:

```swift
.product(name: "ChattingSDK", package: "ChattingSDK")
.product(name: "ChattingSDKUI", package: "ChattingSDK")
```

See [RELEASING.md](RELEASING.md) for the release flow.

## Basic usage

### Required configuration

You need two values before the SDK can connect:

- `baseURL`: use `https://usechatting.com`
- `siteId`: your site/workspace ID inside Chatting

### Present chat from your app

```swift
import SwiftUI
import ChattingSDK
import ChattingSDKUI

struct ContentView: View {
  @State private var isShowingSupport = false

  private let client = ChattingClient(
    baseURL: URL(string: "https://usechatting.com")!,
    siteId: "your-site-id"
  )

  var body: some View {
    Button("Contact support") {
      isShowingSupport = true
    }
    .buttonStyle(.borderedProminent)
    .sheet(isPresented: $isShowingSupport) {
      SupportChatSheet(client: client)
    }
  }
}

private struct SupportChatSheet: View {
  private let viewModel: ChattingConversationViewModel

  init(client: ChattingClient) {
    viewModel = ChattingConversationViewModel(client: client)
  }

  var body: some View {
    NavigationStack {
      ChattingConversationView(
        viewModel: viewModel,
        context: ChattingVisitorContext(pageURL: URL(string: "myapp://support"))
      )
      .navigationTitle("Support")
      .navigationBarTitleDisplayMode(.inline)
    }
  }
}
```

### Identify a signed-in visitor or save an email-only visitor

Put your visitor identity logic in the same sheet you present for support:

```swift
private struct SupportChatSheet: View {
  private let viewModel: ChattingConversationViewModel
  private let signedInEmail: String?
  private let signedInName: String?
  private let draftVisitorEmail: String?

  init(
    client: ChattingClient,
    signedInEmail: String?,
    signedInName: String?,
    draftVisitorEmail: String?
  ) {
    viewModel = ChattingConversationViewModel(client: client)
    self.signedInEmail = signedInEmail
    self.signedInName = signedInName
    self.draftVisitorEmail = draftVisitorEmail
  }

  var body: some View {
    NavigationStack {
      ChattingConversationView(viewModel: viewModel)
        .task {
          if let signedInEmail {
            viewModel.identify(
              ChattingVisitorProfile(
                email: signedInEmail,
                name: signedInName
              )
            )
          } else if let draftVisitorEmail {
            viewModel.emailAddress = draftVisitorEmail
            viewModel.saveEmail()
          }
        }
    }
  }
}
```

Use `identify` when you already know who the customer is. Use `emailAddress` plus `saveEmail()` when you only want a follow-up email without a full signed-in profile.

### Current scope

- Foreground live chat works now, including live conversation sync while the app is open.
- Push notifications and suspended/background delivery are not included in v1 yet.

## Demo scaffold

The package includes a tiny sample under `Examples/ChattingDemo` that now mirrors the same app-level pattern:

- a button in your app UI
- a presented support sheet
- a configured `ChattingClient`
- a simple identify call inside the sheet

## Notes

- The default session store uses `UserDefaults` namespaced by `siteId`.
- The SDK talks to the existing public Chatting APIs under `/api/public/...`.
- This v1 is text-chat focused. Attachments, push notifications, and background delivery are not included yet.
