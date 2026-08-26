function swiftString(value) {
  return JSON.stringify(String(value ?? ""))
    .replaceAll("\\u2028", "\\u{2028}")
    .replaceAll("\\u2029", "\\u{2029}");
}

function swiftCase(id) {
  const words = String(id).split(/[^A-Za-z0-9]+/).filter(Boolean);
  const value = words.map((word, index) => index === 0
    ? word.toLowerCase()
    : `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join("");
  return /^(?:associatedtype|class|deinit|enum|extension|fileprivate|func|import|init|inout|internal|let|open|operator|private|precedencegroup|protocol|public|rethrows|static|struct|subscript|typealias|var)$/.test(value)
    ? `action${value[0].toUpperCase()}${value.slice(1)}` : value;
}

function reducerBody(action) {
  const effect = action.effect;
  switch (effect.type) {
  case "navigate": return effect.targetState
    ? `route = .${swiftCase(effect.targetScreenId)}; values["routeState"] = ${swiftString(effect.targetState)}`
    : `route = .${swiftCase(effect.targetScreenId)}`;
  case "create": return `collections[${swiftString(effect.collectionField)}] = [UUID().uuidString]`;
  case "append": return `collections[${swiftString(effect.collectionField)}, default: []].append(UUID().uuidString)`;
  case "delete": return `collections[${swiftString(effect.collectionField)}, default: []].removeLastIfPresent()`;
  case "toggle": return `flags[${swiftString(effect.stateField)}, default: false].toggle()`;
  case "update":
  case "system": return `values[${swiftString(effect.stateField)}] = ${swiftString(effect.value || "completed")}`;
  default: throw new Error(`Unsupported reducer effect ${effect.type} for ${action.id}`);
  }
}

function compileModel(blueprint) {
  const routes = [...new Set(blueprint.navigation.screens.map(item => item.id))];
  const actions = blueprint.world.actions;
  const fixtures = blueprint.fixtures || [];
  return `import SwiftUI

enum ProductRoute: String, Hashable, Identifiable {
${routes.map(id => `    case ${swiftCase(id)} = ${swiftString(id)}`).join("\n")}
    var id: String { rawValue }
}

enum ProductAction: String, CaseIterable, Identifiable {
${actions.map(action => `    case ${swiftCase(action.id)} = ${swiftString(action.id)}`).join("\n")}
    var id: String { rawValue }
}

@MainActor @Observable
final class LeanProductStore {
    var authenticated = false
    var tab = ProductRoute.${swiftCase(blueprint.navigation.rootTabs[0].screenId)}
    var route: ProductRoute?
    var flags: [String: Bool] = [:]
    var values: [String: String] = [:]
    var collections: [String: [String]] = [:]
    var lastOutcome = ""

    static let fixtureIDs = [${fixtures.map(item => swiftString(item.id)).join(", ")}]
    static let localizedCopy = [${(blueprint.localization || []).map(item => swiftString(item.source)).join(", ")}]

    func perform(_ action: ProductAction) {
        switch action {
${actions.map(action => `        case .${swiftCase(action.id)}:
            ${reducerBody(action)}
            lastOutcome = ${swiftString(action.outcome)}`).join("\n")}
        }
    }
}

private extension Array {
    mutating func removeLastIfPresent() { if !isEmpty { removeLast() } }
}
`;
}

function compileRecipeCatalog(contract) {
  return `import Foundation

struct CompiledScreenRecipe: Identifiable, Hashable {
    let id: String
    let title: String
    let recipe: String
    let actionIDs: [String]
    let states: [String]
}

enum CompiledProductUI {
    static let contractID = ${swiftString(contract.contractId)}
    static let screens: [CompiledScreenRecipe] = [
${contract.surfaces.map(surface => `        .init(
            id: ${swiftString(surface.screenId)}, title: ${swiftString(surface.title)}, recipe: ${swiftString(surface.recipe)},
            actionIDs: [${surface.actions.map(action => swiftString(action.id)).join(", ")}],
            states: [${surface.states.map(swiftString).join(", ")}]
        )`).join(",\n")}
    ]
}
`;
}

export function compileLeanSwiftUIRecipes({ blueprint, contract }) {
  if (!blueprint?.world?.actions?.every(action => action.effect?.type)) {
    throw new Error("SwiftUI Recipe Compiler requires machine-readable effects for every action");
  }
  const screens = new Set(blueprint.navigation.screens.map(item => item.id));
  for (const action of blueprint.world.actions) if (action.effect.type === "navigate"
      && !screens.has(action.effect.targetScreenId)) {
    throw new Error(`${action.id} navigates to missing screen ${action.effect.targetScreenId}`);
  }
  return Object.freeze({
    contractId: contract.contractId,
    files: Object.freeze([
      Object.freeze({ path: "GeneratedProductModel.swift", contents: compileModel(blueprint) }),
      Object.freeze({ path: "GeneratedScreenRecipes.swift", contents: compileRecipeCatalog(contract) }),
    ]),
    receipt: Object.freeze({
      actionCount: blueprint.world.actions.length,
      screenCount: contract.surfaces.length,
      modelOwnedReducers: blueprint.world.actions.length,
      modelGeneratedSwift: false,
    }),
  });
}
