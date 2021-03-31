var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
const Discord = require("discord.js");
require("dotenv").config();

const client = new Discord.Client();
let database = null;

/// Strips all non-alphanumeric characters from a string.
function dbTransform(input) {
	return input.replace(/[\s\W]/g, "").toLowerCase();
}

function displayAlignment(input) {
	switch (input) {
		case "ALIGNMENT_LG":
			return "Lawful Good";
		case "ALIGNMENT_NG":
			return "Neutral Good";
		case "ALIGNMENT_CG":
			return "Chaotic Good";
		case "ALIGNMENT_LN":
			return "Lawful Neutral";
		case "ALIGNMENT_N":
			return "Neutral";
		case "ALIGNMENT_CN":
			return "Chaotic Neutral";
		case "ALIGNMENT_LE":
			return "Lawful Evil";
		case "ALIGNMENT_NE":
			return "Neutral Evil";
		case "ALIGNMENT_CE":
			return "Chaotic Evil";
		default:
			return input;
	}
}

function displayBirthsign(input) {
	switch (input) {
		case "BIRTHSIGN_APPRENTICE":
			return "The Apprentice";
		case "BIRTHSIGN_ATRONACH":
			return "The Atronach";
		case "BIRTHSIGN_LADY":
			return "The Lady";
		case "BIRTHSIGN_LORD":
			return "The Lord";
		case "BIRTHSIGN_LOVER":
			return "The Lover";
		case "BIRTHSIGN_MAGE":
			return "The Mage";
		case "BIRTHSIGN_RITUAL":
			return "The Ritual";
		case "BIRTHSIGN_SERPENT":
			return "The Serpent";
		case "BIRTHSIGN_SHADOW":
			return "The Shadow";
		case "BIRTHSIGN_STEED":
			return "The Steed";
		case "BIRTHSIGN_THIEF":
			return "The Thief";
		case "BIRTHSIGN_TOWER":
			return "The Tower";
		case "BIRTHSIGN_WARRIOR":
			return "The Warrior";
		default:
			return input;
	}
}

client.on("ready", () => {
	console.log("Hello world!");

	var app = firebase.initializeApp({
		apiKey: process.env.FIREBASE_KEY,
		authDomain: "eso-roleplay.firebaseapp.com",
		databaseURL: "https://eso-roleplay.firebaseio.com",
		projectId: "eso-roleplay",
		storageBucket: "eso-roleplay.appspot.com",
		messagingSenderId: "119094011178",
		appId: "1:119094011178:web:0954057546a32fda3e6a53"
	});

	database = firebase.database();
});

client.on("message", (msg) => {
	if (msg.content.startsWith("!profile ")) {
		var charName = msg.content.split(" ");
		charName.splice(0, 1)
		charName = charName.join(" ");

		database.ref("profiles/" + dbTransform(charName)).once("value")
		.then((result) => {
			let profile = result.val();

			if (profile) {
				let output = ("=").repeat(Math.floor((48 - charName.length) / 2)) + " **" + charName.toUpperCase() + "** " + ("=").repeat(Math.ceil((48 - charName.length) / 2)) + "\n";

				if (profile.aliases) output += "**Aliases:** " + profile.aliases + "\n";
				if (profile.alignment) output += "**Alignment:** " + displayAlignment(profile.alignment) + "\n";
				if (profile.birthsign) output += "**Birthsign:** " + displayBirthsign(profile.birthsign) + "\n";
				if (profile.residence) output += "**Primary Residence:** " + profile.residence + "\n";
				if (profile.organizations) output += "**Organizations:** " + profile.organizations + "\n";
				if (profile.alliances) output += "**Alliances:** " + profile.alliances + "\n";
				if (profile.enemies) output += "**Enemies:** " + profile.enemies + "\n";
				if (profile.relationships) output += "**Relationships:** " + profile.relationships + "\n";

				if (profile.description) {
					output += "-".repeat(50) + "\n" + profile.description + "\n";
				} else if (!profile.biography) {
					output += "-".repeat(50) + "\n*No Description Given.*\n";
				}

				if (profile.biography) output += "-".repeat(18) + " **BIOGRAPHY** " + "-".repeat(18) + "\n" + profile.biography + "\n";

				output = output.replace(/#+\s*?.+?\n/g, (match) => { return match.replace(/^#+\s*/, "").toUpperCase(); })
								.replace(/{(.+?)}/g, "$1") // Custom MD formatting - profile links
								.replace(/!(\[.*?\])\(.*?\)/g) // Images
								.replace(/\[(.*?)\]\(.*?\)/g, "$1"); // Links

				if (profile.image) output += profile.image + "\n";
				output += "-".repeat(50) + "\n" + encodeURI("https://eso-rollplay.net/profile.html?character=" + charName);

				while(output.length > 2000) {
					let i = 1999;

					for(i; i >= 0; i--) {
						if (output.charAt(i) === "\n") break;
					}

					if (i < 1) i = 1999;

					msg.channel.send(output.substr(0, i + 1));
					output = output.substr(i + 1);
				}

				msg.channel.send(output);
			} else {
				msg.channel.send("`" + charName + " not found.`");
			}
		})
		.catch((error) => {
			msg.channel.send("`An error has occurred - " + error + "`");
		})
	}
});
  

client.login(process.env.BOT_TOKEN);