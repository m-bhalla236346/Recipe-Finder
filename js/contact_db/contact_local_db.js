class IndexedDB {
    constructor() {
        this.db = null;
        this.isAvailable = false;
    }

    open() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                console.log("Reusing existing IndexedDB connection.");
                resolve(this.db);
                return;
            }

            if ("indexedDB" in window) {
                const request = indexedDB.open("RestaurantApp", 1);

                request.onerror = (event) => {
                    console.error("Error opening IndexedDB:", event.target.error.message);
                    reject(event.target.error.message);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.isAvailable = true;
                    console.log("IndexedDB successfully opened.");
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains("ContactList")) {
                        db.createObjectStore("ContactList", { keyPath: "id", autoIncrement: true });
                        console.log("ContactList store created with autoIncremented ID.");
                    }
                };
            } else {
                reject("IndexedDB not supported in this browser.");
            }
        });
    }

    add(name, email, message) {
        return new Promise(async (resolve, reject) => {
            if (!this.isAvailable || !this.db) {
                console.error("Database is not available. Re-opening...");
                try {
                    await this.open(); // Reopen the database if needed
                } catch (error) {
                    return reject("Failed to reopen database: " + error);
                }
            }

            const transaction = this.db.transaction(["ContactList"], "readwrite");
            const store = transaction.objectStore("ContactList");

            const contact = {
                name,
                email,
                message,
                timestamp: new Date(),
            };

            const request = store.add(contact);

            request.onsuccess = () => {
                console.log("Contact added to IndexedDB:", contact);
                resolve(contact);
            };

            request.onerror = (event) => {
                console.error("Error adding contact to IndexedDB:", event.target.error.message);
                reject(event.target.error.message);
            };
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            if (!this.isAvailable || !this.db) {
                return reject("Database not available.");
            }

            const transaction = this.db.transaction(["ContactList"], "readonly");
            const store = transaction.objectStore("ContactList");
            const request = store.getAll();

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error.message);
        });
    }
}

export default new IndexedDB();
