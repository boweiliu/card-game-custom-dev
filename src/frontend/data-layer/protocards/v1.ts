export class ProtocardClientModel {
  readonly textBody: string;
  readonly id: ProtocardEntityClientId;

  constructor(textBody: string, id: ProtocardEntityClientId = IDGenerator.generate(ID_PREFIXES_V2.PROTOCARD_ENTITY_CLIENT)) {
    this.textBody = textBody;
    this.id = id;
  }
}