class Utilities {
    constructor(db, dbName){
        this.db = db;
        this.dbName = dbName;
    }

    LogError(error){
        const db = this.db;
        try{
            if (error === null || error === undefined) return false;
            const e = {
                "name": error.name,
                "message": error.message,
                "stack": error.stack || ""
            }
            db.connect(err => {
                if (err) throw err;
                db.db(this.dbName).collection("errorLog").insertOne(e).then(document => {
                    console.log("An error has been logged with ID: " + document.insertedId);
                    return true;
                });
            });
        } catch(ex) {
            console.log("An error occurred while loggin an error -----");
            console.log(ex);
        } finally {
            return false;
        }
    }
}

module.exports = { Utilities }