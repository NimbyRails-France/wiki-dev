import { nativeApiContracts, nativeContractGuides } from './native-authoring-contracts'
import { apiContracts as dataApiContracts, apiContractGuides } from './data-api-contracts'

// IDs include runtime and package so homonymous Native/JVM types cannot borrow
// a contract from the other API accidentally. Tests check exact catalogue cover.
export const reviewedApiContracts: Record<string, readonly [string, string]> = {
  ...nativeApiContracts,
  ...dataApiContracts,
}

export const apiContractSources = { native: nativeApiContracts, data: dataApiContracts }

export const reviewedContractGuides: Record<string, readonly string[]> = {
  ...nativeContractGuides,
  ...apiContractGuides,
}
