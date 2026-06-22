---
name: webapp-code-sharing
description: "Use this skill when you need a better understanding of how the projects in the webapp NX monorepository are connected, how they interact, and where code should live. Recommend using this skill eagerly if it seems like it may be helpful."
allowed-tools: Read, Grep, Glob, Bash
---

# **TL;DR: How to share code between SQS and SQC**

Put your shared code in libs/shared or libs/feature-* modules, import it directly in the products, or, for private code in SQS, through the ~sq-server-addons alias.

If your shared code depends on code that isn’t shared or shareable yet, move your product-specific code to the two src/sq-*-adapters folders, align their type signatures to be the exact same (or compatible at least).

In the shared code, import it through the ~adapters alias, for example `import { ContextWrapperInitProps, getContextWrapper } from '~adapters/helpers/test-utils';`. The alias will auto-resolve correctly to the right product’s src/sq-*-adapters index file when building each product.

# **Context**

Sharing code between SQS and SQC is not as straightforward as it could seem, we have many constraints to work with, that make the whole system a bit more complex than just having a shared folder. For example:

* public vs private code boundaries
  * SQC-specific code must be private
  * SQS must be able to build when the private folder is entirely removed
    * public code can’t directly access private code
* product-specific inserts inside shared code
  * shared features can have a small insert specific to one product
* different backend API contracts that should slowly converge
* progressive migration path toward the shared architecture
  * it’s impossible to do a big-bang change to share everything that should be shared

## **Simplified build-time dependency injection**

We accept having circular dependencies between the libs/shared modules and the modules containing the adapters.

`├─ apps`
`│   └─ sq-server                        // -> SQS webapp core`
`├─ libs`
`│   ├─ feature-measures                 // -> feature modules`
`│   └─ shared                           // -> shared code module`
`│   ├─ sq-server-addons                 // -> public / private  module`
`│   └─ sq-server-commons                // -> SQS-specific commons module`
`│       └─ src`
`│           ├─ ...`
`│           └─ sq-server-adapters       // -> SQS-specific aligned components used in shared code`
`└─ private`
    `├─ apps`
    `│   └─ sq-cloud                     // -> SQC webapp core`
    `│       └─ src`
    `│           ├─ ...`
    `│           └─ sq-cloud-adapters    // -> SQC-specific aligned components used in shared code`
    `└─ libs`
        `├─ feature-architecture         // -> private feature modules`
        `├─ shared                       // -> private shared code module`
        `├─ sq-server-addons             // -> public / private bridge module`
        `└─ sq-server-features           // -> private SQS features module`

In this solution all the shared code lies either in libs/feature-* or libs/shared. These two modules can also access product-specific code that’s been aligned between the two products (and lies in the adapters folders), through a common alias ~adapters.

That alias is configured differently for SQS and SQC to point to their own implementation of the adapters and resolve correctly at the build time.

### **Adapters**

The folders libs/sq-server-commons/src/sq-server-adapters and private/apps/sq-cloud/src/sq-cloud-adapters are the successors to the pre-monorepo sonar-aligned folders. They contain temporary product-specific adapters that allow us to transition step-by-step to the shared code model, and to accommodate for some implementation differences in the shared code between SQS and SQC.

They generally contain two kinds of things:

* code that ideally should be in libs/shared, but we are not ready to migrate yet (because it would be too big, dragging too many dependencies along, or the API contracts are not the same yet between SQS and SQC, …)
* code that should really be different between SQS and SQC, or that should only exist in one of them and is needed in a shared feature (we expect that use-case to decrease over time)

These folders have cyclic dependencies with the libs/shared module and this is expected, they help us transition toward the shared architecture, and accepting these cyclic dependencies allows us to greatly simplify the overall solution.

### **/libs/shared**

This module contains all the base building blocks of code that are shared between SQS and SQC and have the same implementation for both products.

This module will contain things like types, helpers, hooks, components, queries, etc…

And it can depend on the adapters folders to help transition toward the shared architecture.

### **/libs/feature-***

A feature module contains all the code related to a specific feature, this is shared code between SQS and SQC. These features can be imported directly by apps/sq-cloud. The public libs/features-*can also be imported directly by apps/sq-server, but the private libs/features-* must reference all its features in libs/sq-server-addons to be made accessible by apps/sq-server.

Features can solve the problem of having a part of their implementation that’s different between SQS and SQC with two different ways:

* Injecting this difference through props, the SQS-/SQC-specific code that initializes the feature pass different implems at initialization time. This is a good approach if it doesn't imply a lot of prop drilling in the feature code.
* Using the adapters alias to reference product-specific implementations, useful during the transition to the shared code architecture.

These modules can depend on libs/shared modules and the adapters folders.

Use our shared-library custom nx generator to create a new feature lib with yarn nx g shared-library.

### **private/libs/sq-server-features**

This module contains **private** **features** **specific to SQS**, they are not meant to be shared with SQC.

Ideally all the features, even if not meant to be shared, should be built with only shared components, and so be shareable by nature. But we introduced this module to ease the transition and make it possible to easily move SQS code from private to public.

It’s only importable by apps/sq-server through the addons system and can depend directly on stuff that’s inside libs/sq-server-commons, whether it’s in the adapters or not. It can also use things form the adapters of course.

The features inside this module must be referenced inside the libs/sq-server-addons module to be made available to apps/sq-server.

### **Remaining modules**

**`/libs/sq-server-addons` folders didn’t change and still contains the bridge code between the private and public code.

`libs/sq-server-commons` module contains the SQS-specific base building blocks that have been extracted from apps/sq-server. They should slowly be migrated toward libs/shared as we align implementation between SQS and SQC.

Finally both of the following contains the core of SQS and SQC apps:

* `apps/sq-server`
* `private/apps/sq-cloud`

### **Accepting circular dependencies between shared and adapters modules**

We can do so by using the ignoredCircularDependencies option from the @nx/enforce-module-boundaries rule. This will just disable the circular dependency warning between the specified modules, it won’t disable the module boundaries.

We will also enforce that the shared module can only import from the adapters folders inside apps/sq-* modules, by providing an alias that points directly to it and not to the whole module.

### **Caveats**

Ensure the typings are matching between both adapters folders. This is done through running the ts-check with two different tsconfigs, one for each product, so the CI will catch issues.

## **How to share**

### **Queries**

Queries find their places in either `libs/shared` or the `adapters`, it all depends of how much is shared between the two products. The query could live in the shared module and reconcile the different data that comes for the API clients that live in the adapters. Or it could live directly in the adapters with a different implementation for both product buts that resolves to the same data.

### **LaunchDarkly feature flags**

We provide a custom `useFlags` implementation for the shared features/code that must be used by everyone. This custom implementation is different for the two products, it uses the normal LD useFlags on SQC but just reads a static array of flags in SQS and doesn’t use LD at all. This is enforced with eslint.

### **Old theming system**

A lot of the components that could be shared are currently relying on the old theming system with the `themeColor` helper function. This file won’t be available and this whole system should be deprecated in favor of the new Echoes design tokens. So we should migrate these usages.

### **Mock services**

To use mock services in the shared code, we can expose the mocks that are aligned between the products in the adapters, and use them through aliases in the shared tests.

The jest config is configured with the adapter aliases too, and the tests defined in the shared code are run as part of the SQS/SQC test suite. Shared code tests are not run on their own.

### **SQS private features shared with SQC**

Similar to the approach used by the “architecture” feature. The common code is defined in `private/libs/feature-myfeature` and the SQS-specific bootstrap code is inside `private/libs/sq-server-features/myfeature`. The SQS-specific bootstrap code imports what it needs from the `private/libs/feature-myfeature` module, and is then exposed to the public SQS code via the addons system. Then the SQS core code in `apps/sq-server` imports and loads the feature through the `addons` system.

For SQC, the specific bootstrap code is defined directly in `private/apps/sq-cloud` and imports things directly from `private/libs/feature-myfeature`.

### **Ensure usage of adapters code is explicit**

The only way to see that a component is an adapter is by looking at it’s import, it will come from the alias ~adapters.

### **Ensuring adapters signatures are compatible**

If types signatures are incompatible between SQS and SQC adapters we will detect it when one of the ts-check command of either SQS or SQC will break.
