import type {
  Host,
  HostsResponse,
  LegacyResponse,
  PageResponse,
  RadiusAccount,
  RadiusProfile,
} from "./types.js";

const CLOUD_BASE_URL = "https://api.ui.com";

export interface UnifiClientConfig {
  apiKey: string;
  hostId?: string;
  site?: string;
}

export class UnifiClient {
  private apiKey: string;
  private hostId: string | undefined;
  private site: string;

  constructor(config: UnifiClientConfig) {
    this.apiKey = config.apiKey;
    this.hostId = config.hostId;
    this.site = config.site ?? "default";
  }

  /** 環境変数からクライアントを生成 */
  static fromEnv(): UnifiClient {
    const apiKey = process.env.UNIFI_API_KEY;
    if (!apiKey) {
      throw new Error("UNIFI_API_KEY が設定されていません");
    }
    return new UnifiClient({
      apiKey,
      hostId: process.env.UNIFI_HOST_ID,
      site: process.env.UNIFI_SITE ?? "default",
    });
  }

  private requireHostId(): string {
    if (!this.hostId) {
      throw new Error(
        "UNIFI_HOST_ID が設定されていません (list-hosts で確認できます)"
      );
    }
    return this.hostId;
  }

  /** Cloud API へ直接リクエスト */
  private async fetchAPI(
    url: string,
    init?: RequestInit
  ): Promise<Response> {
    const res = await fetch(url, {
      ...init,
      headers: {
        "X-API-Key": this.apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`APIエラー (HTTP ${res.status}): ${body}`);
    }
    return res;
  }

  /** Cloud Connector 経由でコンソールにプロキシリクエスト */
  private async connectorRequest<T>(
    method: string,
    proxyPath: string,
    body?: unknown
  ): Promise<T> {
    const hostId = this.requireHostId();
    const url = `${CLOUD_BASE_URL}/v1/connector/consoles/${hostId}${proxyPath}`;
    const res = await this.fetchAPI(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json() as Promise<T>;
  }

  // ── Site Manager API (ホストID不要) ──

  /** ホスト(コンソール)一覧 */
  async listHosts(): Promise<Host[]> {
    const res = await this.fetchAPI(`${CLOUD_BASE_URL}/v1/hosts`);
    const data: HostsResponse = await res.json();
    return data.data;
  }

  // ── RADIUS プロファイル (公式API v1) ──

  /** RADIUSプロファイル一覧 */
  async listRadiusProfiles(siteId: string): Promise<RadiusProfile[]> {
    const path = `/proxy/network/v1/sites/${siteId}/radius/profiles`;
    const data = await this.connectorRequest<PageResponse<RadiusProfile>>(
      "GET",
      path
    );
    return data.data;
  }

  // ── RADIUS ユーザー (従来API) ──

  /** RADIUSユーザー一覧 */
  async listRadiusUsers(): Promise<RadiusAccount[]> {
    const path = `/proxy/network/api/s/${this.site}/rest/account`;
    const data = await this.connectorRequest<LegacyResponse<RadiusAccount>>(
      "GET",
      path
    );
    if (data.meta.rc !== "ok") {
      throw new Error(`APIエラー: ${data.meta.msg}`);
    }
    return data.data;
  }

  /** RADIUSユーザー作成 */
  async createRadiusUser(
    name: string,
    password: string,
    vlan?: number
  ): Promise<RadiusAccount> {
    const path = `/proxy/network/api/s/${this.site}/rest/account`;
    const account: RadiusAccount = { name, x_password: password };
    if (vlan != null && vlan > 0) {
      account.vlan_enabled = true;
      account.vlan = vlan;
      account.tunnel_type = 13;
      account.tunnel_medium_type = 6;
    }
    const data = await this.connectorRequest<LegacyResponse<RadiusAccount>>(
      "POST",
      path,
      account
    );
    if (data.meta.rc !== "ok") {
      throw new Error(`APIエラー: ${data.meta.msg}`);
    }
    if (data.data.length === 0) {
      throw new Error("作成されたアカウントが返却されませんでした");
    }
    return data.data[0];
  }
}
