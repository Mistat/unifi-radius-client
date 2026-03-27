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

// Hotspot バウチャー (従来API)
export interface Voucher {
  _id: string;
  code: string;
  create_time: number;
  duration: number;
  quota: number;
  used: number;
  status: string;
  status_expires?: number;
  start_time?: number;
  end_time?: number;
  note?: string;
  qos_usage_quota?: number;
  qos_rate_max_up?: number;
  qos_rate_max_down?: number;
}

export interface CreateVoucherParams {
  /** 有効期間（分） */
  expire: number;
  /** 発行枚数 (デフォルト: 1) */
  n?: number;
  /** 使用回数制限 (0=無制限, 1=1回限り) */
  quota?: number;
  /** メモ */
  note?: string;
  /** アップロード速度制限 (kbps) */
  up?: number;
  /** ダウンロード速度制限 (kbps) */
  down?: number;
  /** データ転送量制限 (MB) */
  bytes?: number;
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
