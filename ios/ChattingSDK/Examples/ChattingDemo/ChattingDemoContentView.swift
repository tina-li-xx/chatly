import ChattingSDK
import ChattingSDKUI
import SwiftUI

struct ChattingDemoContentView: View {
  @State private var isShowingSupport = false

  private let client = ChattingClient(
    baseURL: URL(string: "https://usechatting.com")!,
    siteId: "replace-with-your-site-id"
  )

  var body: some View {
    NavigationStack {
      VStack(alignment: .leading, spacing: 16) {
        Text("Drop Chatting into your app, then present support as a native sheet.")
          .foregroundStyle(.secondary)

        Button("Contact support") {
          isShowingSupport = true
        }
        .buttonStyle(.borderedProminent)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      .padding()
      .navigationTitle("Chatting Demo")
    }
    .sheet(isPresented: $isShowingSupport) {
      ChattingDemoSupportSheet(client: client)
    }
  }
}

private struct ChattingDemoSupportSheet: View {
  private let viewModel: ChattingConversationViewModel

  init(client: ChattingClient) {
    viewModel = ChattingConversationViewModel(client: client)
  }

  var body: some View {
    NavigationStack {
      ChattingConversationView(
        viewModel: viewModel,
        context: ChattingVisitorContext(pageURL: URL(string: "chatting-demo://support"))
      )
      .navigationTitle("Support")
      .navigationBarTitleDisplayMode(.inline)
      .task {
        viewModel.identify(
          ChattingVisitorProfile(
            email: "customer@example.com",
            name: "Taylor Example"
          )
        )
      }
    }
  }
}
