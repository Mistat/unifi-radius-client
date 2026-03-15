// RADIUSアカウント (従来API)
export interface RadiusAccount {
  _id?: string;
  name: string;
  x_password?: string;
  vlan_enabled?: boolean;
  vlan?: number;
  tunnel_type?: number;
  tunnel_medium_type?: number;
}

// RADIUSプロファイル (公式API)
export interface RadiusProfile {
  id: string;
  name: string;
  metadata: {
    origin: "USER_DEFINED" | "SYSTEM_DEFINED" | "DERIVED";
  };
}

// ホスト情報 (Site Manager API)
export interface Host {
  id: string;
  hardwareId: string;
  type: string;
  ipAddress: string;
  owner: boolean;
  reportedState?: {
    hostname: string;
    version: string;
  };
}

// APIレスポンス型
export interface PageResponse<T> {
  offset: number;
  limit: number;
  count: number;
  totalCount: number;
  data: T[];
}

export interface HostsResponse {
  data: Host[];
  httpStatusCode: number;
}

export interface LegacyResponse<T> {
  meta: {
    rc: string;
    msg?: string;
  };
  data: T[];
}
