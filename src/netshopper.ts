import type { BitBurner as NS, NodeStats } from 'Bitburner'

let ns: NS
let stats: NodeStats[]


export async function main(ns_: NS) {
  ns = ns_

  while (true) {
  }
}

function getAllNodeStats(): NodeStats[] {
  stats = []
  let numNodes = ns.hacknet.numNodes()

  for (let i = 0; i < numNodes; i++) {
    stats.push(ns.hacknet.getNodeStats(i))
  }
}

// taken from source code
// https://github.com/danielyxie/bitburner/blob/be42689697164bf99071c0bcf34baeef3d9b3ee8/src/Hacknet/formulas/HacknetNodes.ts#L4
function calculateMoneyGainRate(level: number, ram: number, cores: number): number {
  const levelMult = level * 1.5 // gain per level in source
  const ramMult = Math.pow(1.035, ram - 1)
  const coresMult = (cores + 5) / 6
  return levelMult * ramMult * coresMult
}