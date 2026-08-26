import SwiftUI
import UIKit

@main
struct SosediApp: App {
    @StateObject private var model = AppModel()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)
    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(model)
                .environment(\.visualLanguage, visualLanguage)
                .tint(visualLanguage.palette.accent)
        }
    }
}

enum Surface: String { case authEmail = "auth-email", authCode = "auth-code", feed = "nearby-feed", post = "post-detail", response = "response-compose", messages = "messages-list", conversation = "conversation-detail", create = "create-post", profile = "profile", neighborhood = "neighborhood-picker", notifications = "notification-settings" }
enum DemoState: String { case loading, populated = "populated/default", empty, error, offline, permissionNeeded = "permission-needed", permissionDenied = "permission-denied", permissionRestricted = "permission-restricted", permissionLimited = "permission-limited" }

struct HelpPost: Identifiable, Codable, Hashable {
    let id: String; let author: String; let title: String; let kind: String; let deadline: String; let distance: String; let asset: String; let description: String
}

@MainActor final class AppModel: ObservableObject {
    @AppStorage("authenticated") var authenticated = false
    @AppStorage("neighborhood") var neighborhood = "Район Абая"
    @AppStorage("agreementCompleted") var agreementCompleted = false
    @Published var surface: Surface = .authEmail
    @Published var selectedTab: Surface = .feed
    @Published var state: DemoState = .populated
    @Published var selected: HelpPost?
    @Published var showResponse = false
    @Published var showCreate = false
    @Published var responseSent = false
    @Published var queued = false
    let posts = [
        HelpPost(id:"post-marina-chair",author:"Марина Соколова",title:"Отдам детский стул",kind:"Предлагаю",deadline:"Сегодня до 20:00",distance:"18 минут пешком",asset:"MediaPhotoChair",description:"Стул в хорошем состоянии. Передам соседям до вечера."),
        HelpPost(id:"post-artem-drill",author:"Артём Ли",title:"Нужна дрель на субботу",kind:"Нужно",deadline:"Суббота, 11:00",distance:"9 минут пешком",asset:"MediaPhotoDrill",description:"Нужна дрель на пару часов, чтобы повесить полку."),
        HelpPost(id:"post-dina-boxes",author:"Дина Ахметова",title:"Помогу донести коробки",kind:"Предлагаю",deadline:"Завтра, 09:00",distance:"1,2 км",asset:"MediaPhotoBoxes",description:"Свободна утром и могу помочь донести коробки до машины.")]
    init() {
        let args = ProcessInfo.processInfo.arguments
        if let index = args.firstIndex(of: "--capture-screen"), args.indices.contains(index + 1), let value = Surface(rawValue: args[index + 1]) { surface = value }
        if let index = args.firstIndex(of: "--capture-state"), args.indices.contains(index + 1), let value = DemoState(rawValue: args[index + 1]) { state = value }
        if args.contains("--reset-session") { authenticated = false }
        if surface != .authEmail && surface != .authCode { authenticated = true }
        if [.messages, .conversation].contains(surface) { selectedTab = .messages }
        else if [.profile, .notifications].contains(surface) { selectedTab = .profile }
        else { selectedTab = .feed }
        selected = posts.first
    }
    func verify(_ code: String) { if code == "246810" { authenticated = true; surface = .feed } else { state = .error } }
    func signOut() { authenticated = false; surface = .authEmail }
}

struct RootView: View {
    @EnvironmentObject var model: AppModel
    var body: some View {
        Group {
            if !model.authenticated || model.surface == .authEmail || model.surface == .authCode { AuthFlow() }
            else { MainShell() }
        }
        .nativeSurface(model.surface.rawValue)
        .preferredColorScheme(.light)
        .background(Color.white)
        .onAppear {
            CaptureIdentity.report(surface: model.surface.rawValue, state: model.state.rawValue)
            CaptureIdentity.reportLayout(viewportWidth: UIScreen.main.bounds.width, contentMinX: 0, contentMaxX: UIScreen.main.bounds.width)
        }
    }
}

struct AuthFlow: View {
    @EnvironmentObject var model: AppModel
    var body: some View {
        NativeEmailAuth(
            productName: "Рядом",
            persistencePromise: "ваши карточки и договорённости",
            initialSurface: model.surface.rawValue,
            captureState: model.state.rawValue,
            emailActionID: "submitEmail",
            codeActionID: "verifyCode",
            codeLength: 6,
            demoCode: "246810"
        ) {
            model.authenticated = true
            model.surface = .feed
        }
    }
}

struct MainShell: View {
    @EnvironmentObject var model: AppModel
    var body: some View {
        TabView(selection:$model.selectedTab) {
            NavigationStack { FeedView() }
                .tabItem {
                    Image(model.selectedTab == .feed
                          ? "lucide.tab.house.selected"
                          : "lucide.tab.house.regular")
                }
                .accessibilityLabel("Рядом")
                .tag(Surface.feed)
            NavigationStack { MessagesView() }
                .tabItem {
                    Image(model.selectedTab == .messages
                          ? "lucide.tab.message-circle.selected"
                          : "lucide.tab.message-circle.regular")
                }
                .accessibilityLabel("Сообщения")
                .tag(Surface.messages)
            NavigationStack { ProfileView() }
                .tabItem {
                    Image(model.selectedTab == .profile
                          ? "lucide.tab.menu.selected"
                          : "lucide.tab.menu.regular")
                }
                .accessibilityLabel("Ещё")
                .tag(Surface.profile)
        }
        .sheet(isPresented:$model.showCreate) { CreatePostView() }
        .sheet(isPresented:$model.showResponse) { ResponseView() }
    }
}

struct FeedView: View {
    @EnvironmentObject var model: AppModel
    @Environment(\.visualLanguage) private var t
    @State private var permissions = Permissions()
    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Рядом") {
                Button {
                    Task {
                        if await permissions.request(.location) == false {
                            model.surface = .neighborhood
                        }
                    }
                } label: {
                    Image(systemName: "location")
                        .frame(width: 44, height: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Найти рядом")

                Button {
                    model.showCreate = true
                } label: {
                    Image(systemName: "plus")
                        .frame(width: 44, height: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Создать")
                .accessibilityIdentifier("openCreate")
            }

            Button {
                model.surface = .neighborhood
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "mappin.and.ellipse")
                        .font(.system(size: 15, weight: .semibold))
                    Text(model.neighborhood)
                        .font(.vkMeta)
                    Spacer()
                    Image(systemName: t.icon(.disclosure))
                        .font(.system(size: 13, weight: .semibold))
                }
                .foregroundStyle(t.palette.accent)
                .padding(.horizontal, t.spacing.contentInset)
                .frame(height: 44)
                .background(t.palette.background)
            }
            .buttonStyle(.plain)

            GroupGap()

            if model.state == .loading {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(0..<2, id: \.self) { _ in
                            VKMedia(assetName: nil, height: 250)
                                .redacted(reason: .placeholder)
                            GroupGap()
                        }
                    }
                }
            } else if model.state == .empty {
                ContentUnavailableView(
                    "Пока ничего рядом",
                    systemImage: "mappin.slash",
                    description: Text("Создайте карточку или выберите другой район")
                )
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        StateBanner()
                        ForEach(model.posts) { post in
                            PostRow(post: post) {
                                model.selected = post
                                model.surface = .post
                            }
                            GroupGap()
                        }
                    }
                }
                .scrollIndicators(.hidden)
            }
        }
        .background(t.palette.groupedBackground.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(isPresented:Binding(get:{model.surface == .post},set:{if !$0 { model.surface = .feed }})) { PostDetailView() }
        .navigationDestination(isPresented:Binding(get:{model.surface == .neighborhood},set:{if !$0 { model.surface = .feed }})) { NeighborhoodView() }
    }
}

struct StateBanner: View {
    @EnvironmentObject var model: AppModel
    var body: some View {
        if model.state == .offline { Label("Офлайн · показан локальный снимок",systemImage:"wifi.slash").foregroundStyle(.secondary) }
        else if model.state == .error { Label("Не удалось обновить. Сохранённые карточки доступны.",systemImage:"exclamationmark.circle").foregroundStyle(.secondary) }
        else if [.permissionDenied,.permissionRestricted].contains(model.state) { Button("Выбрать район вручную") { model.surface = .neighborhood } }
        else { EmptyView() }
    }
}

struct PostRow: View {
    let post: HelpPost
    let onOpen: () -> Void
    @Environment(\.visualLanguage) private var t
    @State private var liked = false
    @State private var saved = false
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                Avatar(name: post.author, size: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text(post.author)
                        .font(.vkRow)
                        .foregroundStyle(t.palette.textPrimary)
                    Text("\(post.deadline) · \(post.distance)")
                        .font(.vkMeta)
                        .foregroundStyle(t.palette.textSecondary)
                        .lineLimit(2)
                }
                .layoutPriority(1)
                Spacer()
                Text(post.kind)
                    .font(.vkMeta)
                    .foregroundStyle(t.palette.accent)
                    .lineLimit(1)
            }
            .padding(.horizontal, t.spacing.contentInset)
            .padding(.vertical, 12)

            Button(action: onOpen) {
                VKMedia(
                    assetName: post.asset,
                    height: 190,
                    accessibilityLabel: mediaDescription(post.asset)
                )
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("open-\(post.id)")

            Text(post.title)
                .font(.role(.action))
                .foregroundStyle(t.palette.textPrimary)
                .padding(.horizontal, t.spacing.contentInset)
                .padding(.top, 12)

            Text(post.description)
                .font(.vkBody)
                .foregroundStyle(t.palette.textPrimary)
                .lineLimit(3)
                .padding(.horizontal, t.spacing.contentInset)
                .padding(.top, 6)
                .padding(.bottom, 2)

            VKPostActions(
                likes: liked ? 13 : 12,
                liked: liked,
                comments: 3,
                shares: 1,
                saved: saved,
                trailing: "сейчас",
                onLike: { liked.toggle() },
                onComment: onOpen,
                onShare: { UIPasteboard.general.string = "ryadom://post/\(post.id)" },
                onSave: { saved.toggle() }
            )
            .padding(.horizontal, t.spacing.contentInset)
            .padding(.vertical, 12)
        }
        .background(t.palette.background)
    }
}

struct PostDetailView: View {
    @EnvironmentObject var model: AppModel
    var post: HelpPost { model.selected ?? model.posts[0] }
    var body: some View {
        ScrollView { VStack(alignment:.leading,spacing:14) {
            HStack { Avatar(name: post.author, size: 48); Text(post.author).font(.headline) }
            VKMedia(assetName: post.asset, height: 240, accessibilityLabel: mediaDescription(post.asset))
            Text(post.title).font(.title2.bold()); Text("\(post.deadline) · \(post.distance)").foregroundStyle(.secondary); Label("Район Абая · точный адрес не публикуется",systemImage:"mappin").font(.subheadline); Text(post.description)
            Button("Откликнуться") { model.showResponse=true }.buttonStyle(.borderedProminent).frame(maxWidth:.infinity).accessibilityIdentifier("openResponse")
            Menu("Ещё") { Button("Пожаловаться",role:.destructive) { model.surface = .feed } }
        }.padding() }.navigationTitle("Карточка помощи").navigationBarTitleDisplayMode(.inline)
    }
}

struct ResponseView: View {
    @EnvironmentObject var model: AppModel
    @Environment(\.dismiss) var dismiss
    @State private var intent="Заберу"
    @State private var time=Date(timeIntervalSince1970:1787664600)
    @State private var message="Здравствуйте! Заберу стул сегодня. Удобно в 18:30?"
    var body: some View { NavigationStack { Form { Section("Карточка") { Text(model.selected?.title ?? "Отдам детский стул") }; Picker("Намерение",selection:$intent){Text("Заберу").tag("Заберу");Text("Помогу").tag("Помогу")}; DatePicker("Предложить время",selection:$time,displayedComponents:[.date,.hourAndMinute]); TextField("Первое сообщение",text:$message,axis:.vertical); if model.state == .offline { Text("Отклик будет поставлен в очередь").foregroundStyle(.secondary) }; Button("Отправить отклик") { model.responseSent=true; model.queued = model.state == .offline; dismiss(); model.selectedTab = .messages; model.surface = .conversation }.buttonStyle(.borderedProminent).accessibilityIdentifier("sendResponse") }.navigationTitle("Отклик").toolbar { Button("Отменить") { dismiss() } } } }
}

struct MessagesView: View {
    @EnvironmentObject var model: AppModel
    var body: some View { List { if model.responseSent || model.state != .empty { Button { model.surface = .conversation } label:{ HStack { Circle().fill(Color.gray.opacity(0.25)).frame(width:46,height:46); VStack(alignment:.leading){Text("Детский стул · Марина").font(.headline);Text("Сегодня в 18:30");Text(model.queued ? "Ожидает отправки" : "Здравствуйте! Заберу стул сегодня…").font(.caption).foregroundStyle(.secondary)} } }.buttonStyle(.plain).accessibilityIdentifier("openConversation") } else { ContentUnavailableView("Сообщений пока нет",systemImage:"message") } }.navigationTitle("Сообщения").navigationDestination(isPresented:Binding(get:{model.surface == .conversation},set:{if !$0 {model.surface = .messages}})){ConversationView()} }
}

struct ConversationView: View {
    @EnvironmentObject var model: AppModel
    @State private var text="Буду у вас в 18:30"
    var body: some View { VStack { ScrollView { VStack(alignment:.leading,spacing:12) { Text("Отдам детский стул").font(.headline); Text("Сегодня в 18:30").foregroundStyle(.secondary); bubble("Здравствуйте! Заберу стул сегодня. Удобно в 18:30?",mine:true); bubble("Да, отлично. Напишу ориентир здесь.",mine:false); if model.agreementCompleted { Label("Помощь завершена",systemImage:"checkmark.circle.fill").foregroundStyle(.green) } }.padding() }; HStack { TextField("Сообщение",text:$text).textFieldStyle(.roundedBorder); Button("Отправить") { text="" }.accessibilityIdentifier("sendMessage") }.padding(); Button("Помощь завершена") { model.agreementCompleted=true }.buttonStyle(.bordered).disabled(model.agreementCompleted).accessibilityIdentifier("completeAgreement").padding(.bottom) }.navigationTitle("Договорённость") }
    func bubble(_ value:String,mine:Bool)->some View { Text(value).padding(10).background(mine ? Color(red:229/255,green:235/255,blue:241/255) : Color(red:242/255,green:243/255,blue:245/255)).clipShape(RoundedRectangle(cornerRadius:12)).frame(maxWidth:.infinity,alignment:mine ? .trailing:.leading) }
}

struct CreatePostView: View {
    @EnvironmentObject var model: AppModel
    @Environment(\.dismiss) var dismiss
    @State private var kind="Нужно"; @State private var description=""; @State private var deadline=Date(timeIntervalSince1970:1787742000); @State private var updates=false
    @State private var permissions = Permissions()
    var body: some View { NavigationStack { Form { if ProcessInfo.processInfo.arguments.contains("--shared-draft") { Section { Text("Черновик из меню «Поделиться»");Text("Не публикуется без подтверждения").foregroundStyle(.secondary) } }; Picker("Тип",selection:$kind){Text("Нужно").tag("Нужно");Text("Предлагаю").tag("Предлагаю")}.pickerStyle(.segmented); TextField("Описание",text:$description,axis:.vertical).accessibilityIdentifier("postDescription"); Button("Добавить фото") { Task { _ = await permissions.request(.photos) } }; DatePicker("Срок",selection:$deadline); Button(model.neighborhood){model.surface = .neighborhood}; Toggle("Сообщать об откликах",isOn:$updates).onChange(of: updates) { _, enabled in if enabled { Task { updates = await permissions.request(.push) } } }; if model.state == .offline { Text("Публикация будет поставлена в очередь") }; Button("Опубликовать") { dismiss(); model.surface = .feed }.buttonStyle(.borderedProminent).disabled(description.isEmpty).accessibilityIdentifier("publishPost") }.navigationTitle("Новая карточка").toolbar { Button("Закрыть") { dismiss() } } } }
}

struct NeighborhoodView: View {
    @EnvironmentObject var model: AppModel
    @Environment(\.dismiss) var dismiss
    var body: some View { List { Section { Text("Показывается только приблизительный район. Точный адрес не публикуется.") }; Button { model.neighborhood="Район Абая"; model.surface = .feed; dismiss() } label:{ HStack { Text("Район Абая");Spacer();Image(systemName:"checkmark") } }.accessibilityIdentifier("chooseAbay"); Button("Орбита"){model.neighborhood="Орбита";model.surface = .feed;dismiss()} }.navigationTitle("Выбор района") }
}

struct ProfileView: View {
    @EnvironmentObject var model: AppModel
    var body: some View { Form { Section("Профиль") { Text("Вы");Text("demo@example.com");LabeledContent("Завершено", value: "0 договорённостей") }; Section { Button(model.neighborhood){model.surface = .neighborhood}; Button("Настройки уведомлений"){model.surface = .notifications} }; Section("Хранение") { Text("Закрытые карточки хранятся локально до 90 дней.") }; Button("Выйти",role:.destructive){model.signOut()}.accessibilityIdentifier("signOut") }.navigationTitle("Профиль").navigationDestination(isPresented:Binding(get:{model.surface == .notifications},set:{if !$0 {model.surface = .profile}})){NotificationSettingsView()} }
}

struct NotificationSettingsView: View { var body: some View { Form { Section("Зачем нужны уведомления") { Text("Новые отклики и изменения активных карточек.") }; Section("Состояние") { Text("Ответы всегда доступны внутри приложения"); Button("Открыть настройки iOS") { if let url=URL(string:UIApplication.openNotificationSettingsURLString){UIApplication.shared.open(url)} } } }.navigationTitle("Уведомления") } }

func mediaDescription(_ id:String)->String { switch id { case "photo-chair": return "Фото детского стула карточки Марины."; case "photo-drill": return "Фото дрели карточки Артёма."; default:return "Фото коробок карточки Дины." } }
