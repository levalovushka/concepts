export function auditActionBindings(manifest, source) {
  const problems = [];
  const strict = (manifest?.qualityContractVersion || 1) >= 2
    || (manifest?.actionContractVersion || 0) >= 1;
  const declared = new Set((manifest?.interactions?.actions || []).map(action => `${action.surface}.${action.id}`));
  const bound = [
    ...[...source.matchAll(/\.nativeAction\("([^"]+)"\)/g)].map(match => match[1]),
    ...[...source.matchAll(/nativeActionID:\s*"([^"]+)"/g)].map(match => match[1]),
    ...[...source.matchAll(/cancelActionID:\s*"([^"]+)"/g)].map(match => match[1]),
  ];

  if (strict) {
    for (const action of declared) {
      const hits = bound.filter(item => item === action).length;
      if (hits === 0) problems.push(`action ${action} is declared but not bound to a control`);
      if (hits > 1) problems.push(`action ${action} is bound ${hits} times; expected one predictable control`);
    }
    for (const action of bound) {
      if (!declared.has(action)) problems.push(`control binds undeclared action ${action}`);
    }
  }

  const feedbackOnly = [
    /Button[^\n]*\{\s*nav\.toast/g,
    /VK\w*Button[^\n]*\{\s*nav\.toast/g,
    /VKRowAction[^\n]*\{\s*nav\.toast/g,
  ];
  for (const pattern of feedbackOnly) {
    for (const match of source.matchAll(pattern)) {
      problems.push(`feedback-only control at source offset ${match.index}: toast cannot be the product outcome`);
    }
  }

  return problems;
}
