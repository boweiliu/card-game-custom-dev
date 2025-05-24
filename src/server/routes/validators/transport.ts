import { Protocard } from '@/server/db/types';
import { ProtocardTransport, ProtocardTransportType } from '@/shared/types/api';

export function transformProtocard(protocard: Protocard): ProtocardTransport {
  return {
    entityId: protocard.id,
    text_body: protocard.text_body,
    type: 'transport.protocard' as ProtocardTransportType,
  };
}
