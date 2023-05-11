import type { BitBurner as NS, NodeStats } from 'Bitburner'

const gainPerLevel = 1.5

export async function main(ns: NS) {

}

// taken from source code
// https://github.com/danielyxie/bitburner/blob/be42689697164bf99071c0bcf34baeef3d9b3ee8/src/Hacknet/formulas/HacknetNodes.ts#L4
function calculateMoneyGainRate(level: number, ram: number, cores: number, mult: number): number {
  const levelMult = level * gainPerLevel
  const ramMult = Math.pow(1.035, ram - 1)
  const coresMult = (cores + 5) / 6
  return levelMult * ramMult * coresMult * mult
}