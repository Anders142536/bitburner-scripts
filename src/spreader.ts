import type { BitBurner as NS } from 'Bitburner'

/** @param {NS} ns */
export async function main(ns: NS) {
	setup(ns)
	let companies = findAllCompanies(ns)


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

	ns.scp('moneymaker.js', company)
	let pid = ns.exec('moneymaker.js', company, 1, company)

	if (pid > 0) {
		ns.print(`successfully jiggled moneymaker on ${company}`)
	} else {
		ns.print(`failed to jiggle moneymaker on ${company}`)
	}
}