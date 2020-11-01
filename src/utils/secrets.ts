import { libx } from 'libx.js/build/bundles/node.essentials';
import path from 'path';
import fs from 'fs';

class Secrets {
	private secretsFile: string;
	private secretsFileOpen: string;
	private secretsFileEmpty: string;
	private secretsKey: string;

	constructor(srcFolder) {
		this.secretsFile = srcFolder + '/project-secrets.json';
		this.secretsFileOpen = srcFolder + '/project-secrets-open.json';
		this.secretsFileEmpty = srcFolder + '/project-secrets-Empty.json';
		this.secretsKey = (libx.node.args.secret != null) ? libx.node.args.secret.toString() : process.env.FUSER_SECRET_KEY;
	}

	lock() {
		if (!fs.existsSync(this.secretsFileOpen) && fs.existsSync(this.secretsFile)) {
			libx.log.w('SecretsLock: did not find decrypted file but has encrypted one, will decrypt...');
			libx.node.decryptFile(this.secretsFile, this.secretsKey, this.secretsFileOpen);
		}
	
		libx.node.encryptFile(this.secretsFileOpen, this.secretsKey, this.secretsFile);
		libx.log.info('Secrets file locked successfully');
	}

	unlock() {
		try {
			libx.node.decryptFile(this.secretsFile, this.secretsKey, this.secretsFileOpen);
			libx.log.info('Secrets file unlocked successfully');
		} catch (ex) { libx.log.warning('Could not decrypt secrets', ex); }
	}

	makeEmpty() {
		if (!fs.existsSync(this.secretsFileOpen))
			libx.node.decryptFile(this.secretsFile, this.secretsKey, this.secretsFileOpen);
		var content = fs.readFileSync(this.secretsFileOpen).toString();
		var obj = JSON.parse(content);
		var empty = libx.makeEmpty(obj);
		fs.writeFileSync(this.secretsFileEmpty, libx.jsonify(empty));
	
		libx.log.info('Empty secrets file was wrote successfully ', this.secretsFileEmpty);
	}
};

module.exports = Secrets;

// Support calling this module from CLI:

const folder = process.cwd() + (libx.node.args.folder || '/src');
libx.log.verbose('Using folder: ', folder);
var cliSecrets = new Secrets(folder);

if (libx.node.isCalledDirectly()) {
	if (libx.node.args.lock) {
		cliSecrets.lock()
	}
	if (libx.node.args.unlock) {
		cliSecrets.unlock();
	}
	if (libx.node.args.empty) {
		cliSecrets.makeEmpty();
	}
}