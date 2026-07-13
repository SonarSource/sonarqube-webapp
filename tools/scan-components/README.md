# Scan Components

This script uses react-scanner to count the uses of components in the webapp.

It's used to track our adoption of @sonarsource/echoes-react.

## One-off scan

```sh
yarn scan-components
```

Generates `.componentscan/components.csv` (gitignored). This can be used to update `State of Echoes adoption - tracking`, but the script below automates tracking over time.


## Track adoption over time (run every week)

```sh
yarn track-adoption
```

This will:

1. Run the component scan to produce a fresh CSV
2. Compute totals (echoes uses, legacy uses, % migrated)
3. Send the data to AWS Cloudwatch for tracking

Reach out to the FEE squad if you want access to the data.
