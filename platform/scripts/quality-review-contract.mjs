/** Pure schema gate for evidence-backed human review. No browser or filesystem. */
export const VISUAL_LENSES = ['hierarchy', 'typography', 'color', 'composition', 'cohesion'];
export const CONSISTENCY_FAMILIES = ['primary-action', 'navigation-chrome', 'surface-language'];

export const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const substantive = (value) => typeof value === 'string' && value.trim().length >= 16;

export const requiresPreviousReview = (review) => (review.visual?.findings || [])
  .some((item) => ['blocker', 'major'].includes(item.severity) && item.status === 'fixed')
  || (review.product?.opportunities || [])
    .some((item) => ['blocker', 'major'].includes(item.impact) && item.resolution === 'implemented');

export function validateHumanReview(manifest, findings, review) {
  const issues = [];
  const productScreens = manifest.screens?.product || [];
  const systemScreens = manifest.screens?.system || [];
  const productSet = new Set(productScreens);
  const systemSet = new Set(systemScreens);
  if (review.reviewer?.role !== 'critic' || !substantive(review.reviewer?.id) || !substantive(review.reviewer?.method)) issues.push('reviewer: нужны отдельная роль critic, устойчивый id и method');
  if (review.product?.verdict !== 'accepted') issues.push('product.verdict должен быть accepted');
  if (!review.product?.strengths?.length) issues.push('product.strengths: нужно зафиксировать, что уже сильно');
  if (!review.product?.opportunities?.length && !substantive(review.product?.noChangeRationale)) issues.push('product: нужны concrete opportunities или evidence-based noChangeRationale');
  for (const item of review.product?.opportunities || []) {
    if (!item.id || !item.impact || !substantive(item.problem) || !substantive(item.proposal) || !item.evidenceScreens?.length) issues.push('product opportunity не полон');
    if ((item.evidenceScreens || []).some((id) => !productSet.has(id))) issues.push(`${item.id || 'product opportunity'}: evidenceScreen не входит в product sheet`);
    if (['blocker', 'major'].includes(item.impact) && !['implemented', 'accepted'].includes(item.resolution)) issues.push(`${item.id}: открыта product ${item.impact}`);
  }
  if (review.visual?.verdict !== 'accepted') issues.push('visual.verdict должен быть accepted');
  const sheet = review.visual?.contactSheetJudgment || {};
  for (const field of ['firstImpression', 'strongestScreen', 'weakestScreen', 'repetitionRisk']) if (!substantive(sheet[field])) issues.push(`visual.contactSheetJudgment.${field}: нужен конкретный вывод по contact sheet`);
  const lenses = new Map((review.visual?.lenses || []).map((item) => [item.lens, item]));
  for (const lens of VISUAL_LENSES) {
    const item = lenses.get(lens);
    if (!item || item.verdict !== 'accepted' || !substantive(item.observation) || !substantive(item.decision) || !item.evidenceScreens?.length) issues.push(`visual.lenses.${lens}: нужен accepted verdict, observation, decision и evidenceScreens`);
    else if (item.evidenceScreens.some((id) => !productSet.has(id))) issues.push(`visual.lenses.${lens}: evidenceScreen не входит в product sheet`);
  }
  const screenReviews = new Map((review.visual?.screenReviews || []).map((item) => [item.screen, item]));
  for (const id of productScreens) {
    const item = screenReviews.get(id);
    if (!item || item.verdict !== 'accepted') { issues.push(`${id}: product screen не принят reviewer`); continue; }
    for (const field of ['evidence', 'hierarchy', 'typography', 'color', 'composition']) if (!substantive(item[field])) issues.push(`${id}: screenReviews.${field} требует конкретного наблюдения`);
  }
  const consistency = new Map((review.visual?.consistency || []).map((item) => [item.family, item]));
  for (const family of CONSISTENCY_FAMILIES) {
    const item = consistency.get(family);
    if (!item || item.verdict !== 'accepted' || !item.systemScreens?.length || !item.productScreens?.length || !substantive(item.observation) || !substantive(item.decision)) {
      issues.push(`visual.consistency.${family}: нужны обе стороны, observation, decision и accepted verdict`);
      continue;
    }
    if (item.systemScreens.some((id) => !systemSet.has(id)) || item.productScreens.some((id) => !productSet.has(id))) issues.push(`visual.consistency.${family}: evidence указан не с той contact sheet`);
  }
  const reviewedSystem = new Set(review.visual?.systemScreensReviewed || []);
  for (const id of systemScreens) if (!reviewedSystem.has(id)) issues.push(`${id}: system/auth screen не подтверждён отдельно`);
  if ([...reviewedSystem].some((id) => !systemSet.has(id))) issues.push('systemScreensReviewed содержит экран вне system sheet');
  if (systemScreens.length && !substantive(review.visual?.systemFit)) issues.push('visual.systemFit: нужен вывод о согласованности product ↔ system, без оценки оригинальности auth');
  const visualFindings = review.visual?.findings || [];
  if (!visualFindings.length && !substantive(review.visual?.noFindingsRationale)) issues.push('visual: пустой findings требует evidence-based noFindingsRationale');
  for (const item of visualFindings) {
    if (!item.id || !productSet.has(item.screen) || !item.severity || !substantive(item.problem) || !substantive(item.evidence) || !item.status) issues.push('visual finding не полон или ссылается не на product screen');
    if (['blocker', 'major'].includes(item.severity) && !['fixed', 'intentional', 'false-positive'].includes(item.status)) issues.push(`${item.id}: открыт ${item.severity}`);
    if (item.status === 'fixed' && !substantive(item.resolution)) issues.push(`${item.id}: fixed finding требует resolution`);
  }
  if (review.iteration?.outcome !== 'accepted') issues.push('iteration.outcome должен быть accepted');
  if (visualFindings.some((item) => item.status === 'fixed') && !(review.iteration?.changes || []).length) issues.push('iteration.changes: нужны изменения после visual findings');
  const signalIds = new Set((findings.signals || []).map((signal) => signal.id));
  const decisions = new Map((review.signals || []).map((signal) => [signal.id, signal]));
  for (const id of signalIds) {
    const decision = decisions.get(id);
    if (!decision || !['defect', 'intentional', 'false-positive'].includes(decision.decision) || !substantive(decision.reason)) issues.push(`${id}: heuristic signal без reviewer judgment и конкретного reason`);
    if (decision?.decision === 'defect' && !visualFindings.some((item) => item.signalId === id && item.status === 'fixed' && substantive(item.resolution))) issues.push(`${id}: defect должен быть связан с fixed visual finding и resolution`);
  }
  return issues;
}

/** Optional critique → change seam. A clean first pass does not invent defects. */
export function validateIterationReview(previousManifest, previousReview, currentManifest, currentReview) {
  const issues = [];
  if (!previousManifest || !previousReview) return ['iteration.previousRunId: указанный critique run должен существовать'];
  if (previousReview.iteration?.outcome !== 'revise') issues.push('предыдущий run должен завершаться iteration.outcome=revise');
  const priorProblems = previousReview.visual?.findings || [];
  if (!priorProblems.some((item) => ['blocker', 'major'].includes(item.severity) && !['fixed', 'intentional', 'false-positive'].includes(item.status))) issues.push('предыдущий run должен содержать открытый visual blocker/major');
  if (sameJson(previousManifest.hashes?.sources, currentManifest.hashes?.sources)) issues.push('между critique и acceptance не изменились source hashes');
  if (!(currentReview.iteration?.changes || []).length) issues.push('iteration.changes: нужно назвать внесённые после critique изменения');
  return issues;
}
