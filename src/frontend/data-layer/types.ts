// Types for frontend data layer

export type FrontendItem = {
    id: string | number;
    value: unknown;
};

export type FrontendMessageStatus = 'pending' | 'acked' | 'failed';
