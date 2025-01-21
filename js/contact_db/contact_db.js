import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

class FirestoreDB {
    constructor() {
        this.db = null;
        this.isAvailable = false;
    }

    open() {
        return new Promise((resolve, reject) => {
            const firebaseConfig = {
                apiKey: "AIzaSyBK5TXwB7AJ2665af0tMKOlvINnbtysMu8",
                authDomain: "recipe-finderapp.firebaseapp.com",
                projectId: "recipe-finderapp",
                storageBucket: "recipe-finderapp.firebasestorage.app",
                messagingSenderId: "1050895285040",
                appId: "1:1050895285040:web:a71aac65b06024bdbba6f5"
              };

            try {
                const app = initializeApp(firebaseConfig);
                this.db = getFirestore(app);
                this.isAvailable = true;
                resolve();
            } catch (error) {
                console.error("Error initializing Firestore:", error);
                reject(error.message);
            }
        });
    }

    add(name, email, message) {
        if (!this.isAvailable) {
            return Promise.reject("Firestore not available.");
        }

        const contactCollection = collection(this.db, "ContactList");
        const contact = { name, email, message, timestamp: new Date() };

        return addDoc(contactCollection, contact)
            .then((docRef) => {
                console.log("Firestore record added with ID:", docRef.id);
                return contact;
            })
            .catch((error) => {
                console.error("Error adding to Firestore:", error);
                throw error;
            });
    }
}

export default new FirestoreDB();
