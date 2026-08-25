import SwiftUI

/// One native OTP input for every concept. A real one-time-code TextField owns
/// keyboard, paste and AutoFill; the visible cells are only its presentation.
struct NativeOTPField: View {
    @Binding var code: String
    var length = 4
    var error: String? = nil
    var isDisabled = false
    var onChange: (String) -> Void = { _ in }

    @Environment(\.visualLanguage) private var t
    @FocusState private var isFocused: Bool

    var body: some View {
        ZStack {
            HStack(spacing: 8) {
                ForEach(0..<length, id: \.self) { index in
                    Text(character(at: index))
                        .textStyle(.code)
                        .monospacedDigit()
                        .foregroundStyle(t.palette.textPrimary)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(
                            t.palette.surface,
                            in: RoundedRectangle(cornerRadius: t.metrics.controlRadius, style: .continuous)
                        )
                        .overlay {
                            RoundedRectangle(cornerRadius: t.metrics.controlRadius, style: .continuous)
                                .stroke(borderColor(at: index), lineWidth: isActive(index) ? 2 : 1)
                        }
                }
            }
            .allowsHitTesting(false)

            TextField("Код из письма", text: $code)
                .keyboardType(.numberPad)
                .textContentType(.oneTimeCode)
                .focused($isFocused)
                .disabled(isDisabled)
                .opacity(0.001)
                .onChange(of: code) { _, value in
                    let normalized = String(value.filter(\.isNumber).prefix(length))
                    if normalized != code { code = normalized }
                    onChange(normalized)
                }
        }
        .frame(maxWidth: .infinity, minHeight: 52)
        .contentShape(Rectangle())
        .onTapGesture { guard !isDisabled else { return }; isFocused = true }
        .onAppear { if !isDisabled { isFocused = true } }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Код из письма")
        .accessibilityValue(code.isEmpty ? "Не введён" : "Введено цифр: \(code.count) из \(length)")
        .accessibilityHint("Введите код с клавиатуры или вставьте его целиком")
        .accessibilityAddTraits(.isKeyboardKey)
    }

    private func character(at index: Int) -> String {
        guard index < code.count else { return "" }
        return String(code[code.index(code.startIndex, offsetBy: index)])
    }

    private func isActive(_ index: Int) -> Bool {
        isFocused && min(code.count, length - 1) == index
    }

    private func borderColor(at index: Int) -> Color {
        if error != nil { return t.palette.danger }
        if isActive(index) { return t.palette.accent }
        return t.palette.separator
    }
}
