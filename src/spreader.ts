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
	while (companies.length > 0) {
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

	ns.tprint('\nall companies are infected, done')
	ns.print('\nall companies are infected, done')
}

// returns array of companies in system
function findAllCompanies() {
	ns.print("finding all companies...")
	let c = findChildCompanies('home')

	ns.print(`found: ${c.length}`)
	return c
}

function findChildCompanies(host: string): string[] {
	let children = ns.scan(host)
	// ns.print(`children of ${host}: ${JSON.stringify(children)}`)
	let grandchildren: string[] = []

	for (let i = 1; i < children.length; i++) {
		grandchildren = grandchildren.concat(findChildCompanies(children[i]))
		// ns.print(`got grandchildren of ${children[i]} (i=${i}): ${JSON.stringify(grandchildren)}`)
	}

	return Array.from(new Set(children.concat(grandchildren)))
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

	// as many as possible, but at least one
	let threadCount = Math.floor(availRam / scriptRam)
	if (threadCount == 0) {
		ns.print(`> couldn't jiggle moneymaker on ${company} due to lack of RAM: ${availRam} RAM`)
		return true
	}

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