import type { BitBurner as NS } from 'Bitburner'

/** @param {NS} ns */
export async function main(ns: NS) {
	ns.disableLog("ALL")
	let company = ns.args[0]
	let minSecLevel = ns.getServerMinSecurityLevel(company) + 1
	let mMax = ns.getServerMaxMoney(company) * 0.75

	// TODO optimize ram costs

	while (true) {
		let secLevel = ns.getServerSecurityLevel(company)
		while (secLevel > minSecLevel) {
			// TODO change this to sprintf
			ns.print(`sec level ${secLevel}/${minSecLevel}, weakening...`)
			await ns.weaken(company)
			secLevel = ns.getServerSecurityLevel(company)
		}

		let mAvail = ns.getServerMoneyAvailable(company)
		if (mAvail < mMax) {
			// TODO change this to sprintf
			ns.print(`money ${mAvail}/${mMax}, growing...`)
			await ns.grow(company)
		} else {
			let gain = await ns.hack(company)
			ns.print(`hacked ${company} for ${gain}$`)
		}
	}
}