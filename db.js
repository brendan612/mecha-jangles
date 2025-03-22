require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

class Database {
	constructor() {
		this.supabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_KEY
		);
	}
}

module.exports = Database;
