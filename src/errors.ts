export type BPayloadErrorCode =
  | 'directive-injection-failed'
  | 'marker-collision'
  | 'payload-version-mismatch'
  | 'binary-spawn-failed'
  | 'binary-timeout'
  | 'binary-malformed-output'
  | 'config-malformed'
  | 'collection-not-allowlisted'
  | 'field-name-conflict'
  | 'admin-component-mount-failed'
  | 'fanout-budget-exceeded'

export interface BPayloadErrorDetails {
  readonly code: BPayloadErrorCode
  readonly message: string
  readonly cause?: unknown
}

export class BPayloadError extends Error {
  readonly code: BPayloadErrorCode

  override readonly cause?: unknown

  constructor(details: BPayloadErrorDetails) {
    super(details.message)
    this.name = 'BPayloadError'
    this.code = details.code
    this.cause = details.cause
  }
}
