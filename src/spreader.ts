import type { BitBurner as NS } from 'Bitburner'

let ns: NS
let scriptRam: number
let scripts: Scripts = {}
let availableScriptsCount: number


/** @param {NS} ns */
export async function main(ns_: NS) {
	ns = ns_
	ns.disableLog("ALL")
	ns.print("\n\n")

	let companies = findAllCompanies()
	scriptRam = ns.getScriptRam('moneymaker.js')

	let prevHLevel = 0
	while (true) {
		let hLevel = ns.getHackingLevel()
		if (prevHLevel == hLevel) {
			ns.print('hacking level didn\'t change, waiting...')
			// wait one minute
			await ns.sleep(1000 * 60)
			continue
		}
		ns.print(`hacking level changed from ${prevHLevel} to ${hLevel}`)
		ns.print(`attempting to hack ${companies.length} companies`)
		let hacked: string[] = []
		checkForCrackScripts()

		for (let company of companies) {
			if (!isHackable(company, hLevel)) {
				ns.print(`${company} not hackable!`)
				continue
			}
			if (!ns.hasRootAccess(company)) {
				ns.tprint(`nuking ${company}`)
				ns.print(`nuking ${company}`)
				crackPorts(company)
				ns.nuke(company)
			}
			let hackSuccessful = await hack(company)
			if (hackSuccessful) {
				hacked.push(company)
			}
		}

		for (let company of hacked) {
			companies.splice(companies.indexOf(company), 1)
		}

		ns.print(`${companies.length} companies left in list`)
		prevHLevel = hLevel
	}
}

// returns array of companies in system
// TODO: make this a recursive scan
function findAllCompanies() {
	ns.print("finding all companies...")
	let c = ns.scan("home")

	ns.print(`found: ${c.length}`)
	return c
}

function isHackable(company: string, hLevel: number) {
	let cHLevel = ns.getServerRequiredHackingLevel(company)
	let reqOpenPorts = ns.getServerNumPortsRequired(company)

	return cHLevel <= hLevel && reqOpenPorts <= availableScriptsCount
}

function checkForCrackScripts() {
	scripts = {
		ssh: checkFile('BruteSSH.exe'),
		ftp: checkFile('FTPCrack.exe'),
		smtp: checkFile('relaySMTP.exe'),
		http: checkFile('HTTPWorm.exe'),
		sql: checkFile('SQLInject.exe'),
	}

	availableScriptsCount = 0
	for (let script in scripts) {
		if (scripts[script])
			availableScriptsCount++
	}
}

function checkFile(file: string): boolean {
	return ns.fileExists(file)
}

function crackPorts(company: string) {
	if (scripts.ssh)
		ns.brutessh(company)
	if (scripts.ftp)
		ns.ftpcrack(company)
	if (scripts.smtp)
		ns.relaysmtp(company)
	if (scripts.http)
		ns.httpworm(company)
	if (scripts.sql)
		ns.sqlinject(company)
}

async function hack(company: string): Promise<boolean> {
	// the hack method should only trigger once per company, so this *should* not
	// kill the started scripts
	ns.killall(company)

	ns.print(`hacking: ${company}`)
	ns.scp('moneymaker.js', company)

	let maxRam = ns.getServerMaxRam(company)
	let usedRam = ns.getServerUsedRam(company)
	let availRam = maxRam - usedRam
	let threadCount = Math.floor(availRam / scriptRam)

	let pid = ns.exec('moneymaker.js', company, threadCount, company)

	if (pid > 0) {
		ns.tprint(`> successfully jiggled moneymaker on ${company} with ${threadCount} threads`)
		ns.print(`> successfully jiggled moneymaker on ${company} with ${threadCount} threads`)
		return true
	}
	ns.tprint(`> failed to jiggle moneymaker on ${company} with ${threadCount} threads`)
	ns.print(`> failed to jiggle moneymaker on ${company} with ${threadCount} threads`)
	return false

}



interface Scripts {
	[key: string]: boolean
}