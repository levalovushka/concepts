import { createStructuredModelExperiencePlanner } from "./structured-model-experience-planner.mjs";
import { createStructuredModelNativeRenderer } from "./structured-model-native-renderer.mjs";
import { createStructuredModelProductEvaluator } from "./structured-model-product-evaluator.mjs";
import { createStructuredModelProductFactory } from "./structured-model-product-factory.mjs";
import { createStructuredModelProductReviser } from "./structured-model-product-reviser.mjs";
import { createStructuredModelVisualDirectionEvaluator } from "./structured-model-visual-direction-evaluator.mjs";
import { createStructuredModelVisualDirectionGenerator } from "./structured-model-visual-direction-generator.mjs";
import { createStructuredVisionProductUICritic } from "./structured-vision-product-ui-critic.mjs";

export function createStructuredModelFactoryAdapters({
  productModel,
  evaluatorModel,
  experienceModel = productModel,
  visualModel = productModel,
  visualEvaluatorModel = evaluatorModel,
  rendererModel = productModel,
  revisionModel = productModel,
  visionModel,
  visionReviewerName = "independent-native-vision-critic",
  assetProvider,
  projectRoot,
  executor,
}) {
  if (productModel === evaluatorModel) throw new TypeError("Product generator and evaluator must use independent model clients");
  if (rendererModel === visionModel) throw new TypeError("Native renderer and visual critic must use independent model clients");
  const productUICritic = createStructuredVisionProductUICritic({ model: visionModel, reviewerName: visionReviewerName });
  return Object.freeze({
    productFactoryGenerator: createStructuredModelProductFactory({ model: productModel }),
    productFactoryEvaluator: createStructuredModelProductEvaluator({ model: evaluatorModel }),
    experiencePlanner: createStructuredModelExperiencePlanner({ model: experienceModel }),
    visualDirectionGenerator: createStructuredModelVisualDirectionGenerator({ model: visualModel }),
    visualDirectionEvaluator: createStructuredModelVisualDirectionEvaluator({ model: visualEvaluatorModel }),
    factoryRenderer: createStructuredModelNativeRenderer({
      model: rendererModel, assetProvider, projectRoot, executor, previewReviewer: productUICritic,
    }),
    productUICritic,
    productRevisionAdapter: createStructuredModelProductReviser({ model: revisionModel }),
  });
}
