import { Protocard } from '@/server/db/types';
import { ProtocardTransport, ProtocardTransportType } from '@/shared/types/api';
import { IDGenerator, ID_PREFIXES } from '@/shared/types/id-prefixes';

export function transformProtocard(protocard: Protocard): ProtocardTransport {
  return {
    entityId: IDGenerator.fromLegacyId(protocard.id, ID_PREFIXES.PROTOCARD),
    textBody: protocard.text_body,
    type: 'transport.protocard' as ProtocardTransportType,
  };
}
