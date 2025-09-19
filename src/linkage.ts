import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { VpcSecurityGroupEgressRule } from "@cdktf/provider-aws/lib/vpc-security-group-egress-rule";
import { VpcSecurityGroupIngressRule } from "@cdktf/provider-aws/lib/vpc-security-group-ingress-rule";
import { Construct } from "constructs";
import { isIPv4, isIPv6 } from "net";
import { isDataAwsEc2ManagedPrefixList } from "./resources/peers/data-aws-ec2-managed-prefix-list";
import { isDataAwsSecurityGroup } from "./resources/peers/data-aws-security-group";
import { isEc2ManagedPrefixList } from "./resources/peers/ec2-managed-prefix-list";
import { isSecurityGroup } from "./resources/peers/security-group";

export interface IPeer {
  readonly uniqueId: string;
  readonly peerId: string;
}

const PORT_SYMBOL = Symbol.for("PORT");

export class Port {
  readonly port: number;

  constructor(port: number) {
    Object.defineProperty(this, PORT_SYMBOL, { value: true });
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
      throw new Error(`Invalid port number: ${port}`);
    }
    this.port = port;
  }
}

export function isPort(x: unknown): x is Port {
  return x != null && typeof x === "object" && PORT_SYMBOL in x;
}

const IPV4_SYMBOL = Symbol.for("IPV4");
const IPV6_SYMBOL = Symbol.for("IPV6");

export function isIpv4(x: unknown): x is Ipv4 {
  return x != null && typeof x === "object" && IPV4_SYMBOL in x;
}

export function isIpv6(x: unknown): x is Ipv6 {
  return x != null && typeof x === "object" && IPV6_SYMBOL in x;
}

export class Ipv4 implements IPeer {
  readonly peerId: string;
  readonly uniqueId: string;
  readonly address: string;
  readonly prefixLength: number;

  constructor(address: string, prefixLength: number) {
    Object.defineProperty(this, IPV4_SYMBOL, { value: true });

    if (!isIPv4(address)) {
      throw new Error(`Invalid IPv4 address: ${address}`);
    }
    if (!Number.isInteger(prefixLength)) {
      throw new Error(`Invalid prefix length: ${prefixLength}`);
    }
    if (prefixLength < 0 || prefixLength > 32) {
      throw new Error(`Invalid prefix length: ${prefixLength}`);
    }

    this.peerId = `${address}/${prefixLength}`;
    this.uniqueId = this.peerId;
    this.address = address;
    this.prefixLength = prefixLength;
  }
}

export class Ipv6 implements IPeer {
  readonly peerId: string;
  readonly uniqueId: string;
  readonly address: string;
  readonly prefixLength: number;

  constructor(address: string, prefixLength: number) {
    Object.defineProperty(this, IPV6_SYMBOL, { value: true });
    if (!isIPv6(address)) {
      throw new Error(`Invalid IPv6 address: ${address}`);
    }
    if (!Number.isInteger(prefixLength)) {
      throw new Error(`Invalid prefix length: ${prefixLength}`);
    }
    if (prefixLength < 0 || prefixLength > 128) {
      throw new Error(`Invalid prefix length: ${prefixLength}`);
    }
    this.peerId = `${address}/${prefixLength}`;
    this.uniqueId = this.peerId;
    this.address = address;
    this.prefixLength = prefixLength;
  }
}

const directions = ["in", "out"] as const;
type Direction = (typeof directions)[number];

const protocols = ["tcp", "udp", "icmp", "icmpv6", "all"] as const;
type Protocol = (typeof protocols)[number];

interface ILinkageRule {
  readonly direction: Direction;
  readonly fromPort: Port;
  readonly toPort: Port;
  readonly protocol: Protocol;
  readonly peer: IPeer;
}

export function uniqueIdFrom(linkableRule: ILinkageRule): string {
  return `${linkableRule.direction}:${linkableRule.protocol}:${linkableRule.fromPort.port}-${linkableRule.toPort.port}:${linkableRule.peer.uniqueId}`;
}

function isILinkageRule(x: unknown): x is ILinkageRule {
  if (x == null || typeof x !== "object") {
    return false;
  }
  const rule = x as Record<keyof ILinkageRule, unknown>;
  if (typeof rule.direction !== "string") {
    return false;
  }
  if (!directions.some((d) => d === rule.direction)) {
    return false;
  }
  if (!isPort(rule.fromPort) || !isPort(rule.toPort)) {
    return false;
  }
  if (typeof rule.protocol !== "string") {
    return false;
  }
  if (!protocols.some((p) => p === rule.protocol)) {
    return false;
  }
  if (typeof rule.peer !== "object" || rule.peer == null) {
    return false;
  }
  const peer = rule.peer as Record<keyof IPeer, unknown>;
  if (typeof peer.peerId !== "string") {
    return false;
  }
  return true;
}

export interface ILinkage extends IPeer {
  readonly linkageRules: readonly ILinkageRule[];
  allowFrom(
    peer: IPeer,
    fromPort: Port,
    toPort: Port,
    protocol: Protocol,
    isTwoWayLink?: boolean | undefined,
  ): Linkage;
  allowTo(
    peer: IPeer,
    fromPort: Port,
    toPort: Port,
    protocol: Protocol,
    isTwoWayLink?: boolean | undefined,
  ): Linkage;
}

function isILinkage(x: unknown): x is ILinkage {
  if (x == null || typeof x !== "object") {
    return false;
  }
  const linkage = x as Record<keyof ILinkage, unknown>;
  if (!Array.isArray(linkage.linkageRules)) {
    return false;
  }
  if (!linkage.linkageRules.every(isILinkageRule)) {
    return false;
  }
  if (typeof linkage.allowFrom !== "function") {
    return false;
  }
  if (typeof linkage.allowTo !== "function") {
    return false;
  }
  return true;
}

const LINKAGE_SYMBOL = Symbol.for("Linkage");

export interface LinkageProps {
  readonly peer: SecurityGroup;
}

export class Linkage extends Construct implements ILinkage {
  private readonly _linkageRules: ILinkageRule[];
  get linkageRules(): readonly ILinkageRule[] {
    return this._linkageRules;
  }
  readonly securityGroup: SecurityGroup;
  readonly peerId: string;
  readonly uniqueId: string;

  constructor(scope: Construct, id: string, props: LinkageProps) {
    super(scope, id);
    Object.defineProperty(this, LINKAGE_SYMBOL, { value: true });
    if (!isSecurityGroup(props.peer)) {
      throw new Error("peer must be a SecurityGroup");
    }
    this.securityGroup = props.peer;
    this.peerId = props.peer.peerId;
    this._linkageRules = [];
    this.uniqueId = this.node.id;
  }

  public static isLinkage(x: unknown): x is Linkage {
    return x != null && typeof x === "object" && LINKAGE_SYMBOL in x;
  }

  private allow(this: Linkage, rule: ILinkageRule): Linkage {
    if (
      this.linkageRules.some(
        (r) =>
          r.direction === rule.direction &&
          r.fromPort === rule.fromPort &&
          r.toPort === rule.toPort &&
          r.protocol === rule.protocol &&
          r.peer.uniqueId === rule.peer.uniqueId,
      )
    ) {
      throw new Error(
        `The same linkage rule already exists: ${JSON.stringify({ direction: rule.direction, fromPort: rule.fromPort, toPort: rule.toPort, protocol: rule.protocol, peer: rule.peer.uniqueId })}`,
      );
    }
    this._linkageRules.push(rule);

    if (rule.direction === "in") {
      new VpcSecurityGroupIngressRule(
        this,
        `IngressRule:${uniqueIdFrom(rule)}`,
        {
          fromPort: rule.fromPort.port,
          toPort: rule.toPort.port,
          ipProtocol: rule.protocol,
          securityGroupId: this.securityGroup.peerId,
          ...(() => {
            if (isIpv4(rule.peer)) {
              return { cidrIpv4: rule.peer.peerId };
            } else if (isIpv6(rule.peer)) {
              return { cidrIpv6: rule.peer.peerId };
            } else if (isEc2ManagedPrefixList(rule.peer)) {
              return { prefixListId: rule.peer.peerId };
            } else if (isDataAwsEc2ManagedPrefixList(rule.peer)) {
              return { prefixListId: rule.peer.peerId };
            } else if (isSecurityGroup(rule.peer)) {
              return { sourceSecurityGroupId: rule.peer.peerId };
            } else if (isDataAwsSecurityGroup(rule.peer)) {
              return { referencedSecurityGroupId: rule.peer.peerId };
            } else if (Linkage.isLinkage(rule.peer)) {
              return {
                referencedSecurityGroupId: rule.peer.securityGroup.peerId,
              };
            } else {
              throw new Error(`Unsupported peer type: ${rule.peer.peerId}`);
            }
          })(),
        },
      );
    } else if (rule.direction === "out") {
      new VpcSecurityGroupEgressRule(this, `EgressRule:${uniqueIdFrom(rule)}`, {
        fromPort: rule.fromPort.port,
        toPort: rule.toPort.port,
        ipProtocol: rule.protocol,
        securityGroupId: this.securityGroup.peerId,
        ...(() => {
          if (isIpv4(rule.peer)) {
            return { cidrIpv4: rule.peer.peerId };
          } else if (isIpv6(rule.peer)) {
            return { cidrIpv6: rule.peer.peerId };
          } else if (isEc2ManagedPrefixList(rule.peer)) {
            return { prefixListId: rule.peer.peerId };
          } else if (isDataAwsEc2ManagedPrefixList(rule.peer)) {
            return { prefixListId: rule.peer.peerId };
          } else if (isSecurityGroup(rule.peer)) {
            return { destinationSecurityGroupId: rule.peer.peerId };
          } else if (isDataAwsSecurityGroup(rule.peer)) {
            return { referencedSecurityGroupId: rule.peer.peerId };
          } else if (Linkage.isLinkage(rule.peer)) {
            return {
              referencedSecurityGroupId: rule.peer.securityGroup.peerId,
            };
          } else {
            throw new Error(`Unsupported peer type: ${rule.peer.peerId}`);
          }
        })(),
      });
    } else {
      throw new Error(`Invalid direction: ${rule.direction satisfies never}`);
    }
    return this;
  }
  public allowFrom(
    this: Linkage,
    peer: IPeer,
    fromPort: Port,
    toPort: Port,
    protocol: Protocol,
    isTwoWayLink: boolean = true,
  ): Linkage {
    this.allow({
      direction: "in",
      fromPort: fromPort,
      toPort: toPort,
      protocol: protocol,
      peer: peer,
    });

    if (isILinkage(peer) && isTwoWayLink) {
      peer.allowTo(peer, fromPort, toPort, protocol, false);
    }
    return this;
  }

  public allowTo(
    this: Linkage,
    peer: IPeer,
    fromPort: Port,
    toPort: Port,
    protocol: Protocol,
    isTwoWayLink: boolean = true,
  ): Linkage {
    this.allow({
      direction: "out",
      fromPort: fromPort,
      toPort: toPort,
      protocol: protocol,
      peer: peer,
    });
    if (isILinkage(peer) && isTwoWayLink) {
      peer.allowFrom(peer, fromPort, toPort, protocol, false);
    }
    return this;
  }
}

export interface ILinkable {
  readonly linkage: ILinkage;
}
