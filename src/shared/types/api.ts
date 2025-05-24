// API request/response types

export interface CreateProtocardRequest {
  text_body: string;
}

export interface UpdateProtocardRequest {
  text_body: string;
}

export interface ProtocardResponse {
  id: number;
  text_body: string;
  message: string;
}

export interface ProtocardCountResponse {
  count: number;
}
