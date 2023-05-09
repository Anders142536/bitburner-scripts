import type { BitBurner as NS } from 'Bitburner'

/** @param {NS} ns */
export async function main(ns: NS) {
	setup(ns)
	let companies = findAllCompanies(ns)


	while (true) {
		let hLevel = ns.getHackingLevel()
		for (let company of companies) {
			if (!isHackable(ns, company, hLevel)) {
				continue
			}
			if (!ns.hasRootAccess(company)) {
				ns.print(`nuking ${company}`)
				ns.nuke(company)
			}
			await hack(ns, company)

		}
	}
}

function setup(ns: NS) {
	ns.disableLog("ALL")

	ns.print("\n\n")
}

// returns array of companies in system
// TODO: make this a recursive scan
function findAllCompanies(ns: NS) {
	ns.print("finding all companies...")
	let c = ns.scan("home")


	ns.print(`found: ${c.length}`)
	return c
}

function isHackable(ns: NS, company: string, hLevel: number) {
	let cHLevel = ns.getServerRequiredHackingLevel(company)
	let reqOpenPorts = ns.getServerNumPortsRequired(company)

	if (cHLevel <= hLevel && reqOpenPorts == 0) {
		// ns.print(`hackable company: ${company}`)
		return true
	}
	return false
}

async function hack(ns: NS, company: string) {
	ns.print(`hacking: ${company}`)

	let secLevel = ns.getServerSecurityLevel(company)
	let minSecLevel = ns.getServerMinSecurityLevel(company) + 1

	while (secLevel > minSecLevel) {
		ns.print(`server min sec level of ${minSecLevel} not yet reached: ${secLevel}`)
		await ns.weaken(company)
		secLevel = ns.getServerSecurityLevel(company)
	}

	let mAvail = ns.getServerMoneyAvailable(company)
	let mMax = ns.getServerMaxMoney(company) * 0.75
	if (mAvail < mMax) {
		ns.print(`server max money threshhold of ${mMax} not yet reached: ${mAvail}`)
		await ns.grow(company)
	} else {
		let gain = await ns.hack(company)
		ns.print(`hacked company for ${gain}`)

	}

}