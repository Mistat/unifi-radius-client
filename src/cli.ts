#!/usr/bin/env tsx
import { UnifiClient } from "./client.js";

const USAGE = `UniFi RADIUSユーザー管理ツール

使い方:
  npx tsx src/cli.ts list-hosts                        ホスト(コンソール)一覧
  npx tsx src/cli.ts list-users                        RADIUSユーザー一覧
  npx tsx src/cli.ts create-user <名前> <パスワード>    RADIUSユーザー作成
  npx tsx src/cli.ts create-user <名前> <パスワード> <VLAN>  VLAN付きで作成
  npx tsx src/cli.ts list-profiles <サイトID>           RADIUSプロファイル一覧

環境変数:
  UNIFI_API_KEY   UI.com APIキー (必須)
  UNIFI_HOST_ID   コンソールのホストID (list-hosts以外で必須)
  UNIFI_SITE      サイト名 (デフォルト: "default")`;

function table(headers: string[], rows: string[][]): void {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length))
  );
  const fmt = (cols: string[]) =>
    cols.map((c, i) => c.padEnd(widths[i])).join("  ");

  console.log(fmt(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) {
    console.log(fmt(row));
  }
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    console.error(USAGE);
    process.exit(1);
  }

  const client = UnifiClient.fromEnv();

  switch (command) {
    case "list-hosts": {
      const hosts = await client.listHosts();
      table(
        ["ホストID", "タイプ", "IP", "ホスト名"],
        hosts.map((h) => [
          h.id,
          h.type,
          h.ipAddress,
          h.reportedState?.hostname ?? "-",
        ])
      );
      console.log("\n→ UNIFI_HOST_ID に上記のホストIDを設定してください");
      break;
    }

    case "list-users": {
      const users = await client.listRadiusUsers();
      table(
        ["ID", "ユーザー名", "VLAN"],
        users.map((u) => [
          u._id ?? "",
          u.name,
          u.vlan_enabled ? String(u.vlan) : "-",
        ])
      );
      console.log(`\n合計: ${users.length} ユーザー`);
      break;
    }

    case "create-user": {
      if (args.length < 2) {
        console.error(
          "使い方: create-user <名前> <パスワード> [VLAN]"
        );
        process.exit(1);
      }
      const [name, password, vlanStr] = args;
      const vlan = vlanStr ? parseInt(vlanStr, 10) : undefined;
      const account = await client.createRadiusUser(name, password, vlan);
      console.log("RADIUSユーザーを作成しました:");
      console.log(`  ID:         ${account._id}`);
      console.log(`  ユーザー名: ${account.name}`);
      if (account.vlan_enabled) {
        console.log(`  VLAN:       ${account.vlan}`);
      }
      break;
    }

    case "list-profiles": {
      if (args.length < 1) {
        console.error("使い方: list-profiles <サイトID>");
        process.exit(1);
      }
      const profiles = await client.listRadiusProfiles(args[0]);
      table(
        ["ID", "名前", "オリジン"],
        profiles.map((p) => [p.id, p.name, p.metadata.origin])
      );
      break;
    }

    default:
      console.error(`不明なコマンド: ${command}`);
      console.error(USAGE);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`エラー: ${err.message}`);
  process.exit(1);
});
