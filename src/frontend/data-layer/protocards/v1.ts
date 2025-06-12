
export const _generateId = () => IDGenerator.generate(PREFIXES.PROTOCARD_ENTITY_CLIENT);

export type ProtocardClientModel = Readonly<ProtocardContent> & {
  readonly id: ProtocardEntityClientId;
}