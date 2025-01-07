import IndexedDB from "../js/contact_db/contact_local_db.js";
import FirestoreDB from "../js/contact_db/contact_db.js";

// Check if the current page is contact.html
if (window.location.pathname.includes("contact.html")) {
    async function initializeDatabases() {
        try {
            await IndexedDB.open();
            console.log("IndexedDB initialized.");
            await FirestoreDB.open();
            console.log("Firestore initialized.");
        } catch (error) {
            console.error("Error initializing databases:", error);
        }
    }

    const contactForm = document.getElementById("contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();
            const messageOutput = document.getElementById("message-output");

            if (!name || !email || !message) {
                messageOutput.innerHTML = "<div class='error'>Please fill in all fields.</div>";
                return;
            }

            try {
                await IndexedDB.add(name, email, message);
                console.log("Data saved to IndexedDB.");

                if (navigator.onLine) {
                    await FirestoreDB.add(name, email, message);
                    console.log("Data synced with Firestore.");
                } else {
                    console.log("Offline: Data will sync later.");
                }

                messageOutput.innerHTML = "<div class='success'>Data saved successfully!</div>";
                contactForm.reset();
            } catch (error) {
                console.error("Error saving data:", error);
                messageOutput.innerHTML = "<div class='error'>Failed to save data. Please try again later.</div>";
            }
        });
    } else {
        console.error("Contact form not found on contact.html.");
    }

    initializeDatabases();
}

// Service Worker Registration
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
            console.log("Service Worker registered successfully.");
        })
        .catch((error) => {
            console.error("Service Worker registration failed:", error);
        });
} else {
    console.warn("Service Worker is not supported in this browser.");
}

// Notification API
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.error("Notifications are not supported by this browser.");
        return;
    }

    Notification.requestPermission()
        .then((permission) => {
            if (permission === "granted") {
                console.log("Notification permission granted.");
                showNotification("Welcome!", "Thank you for enabling notifications.");
                subscribeToPush(); // Push API subscription
            } else {
                console.warn("Notification permission denied.");
            }
        })
        .catch((error) => {
            console.error("Error requesting notification permission:", error);
        });
}

function showNotification(title, body) {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.showNotification(title, {
                    body,
                    icon: "/icons/manifest-icon-192.maskable.png",
                    badge: "/icons/manifest-icon-192.maskable.png",
                });
            })
            .catch((error) => {
                console.error("Error showing notification:", error);
            });
    } else {
        console.error("Notifications or Service Workers are not supported.");
    }
}

// Push API
async function subscribeToPush() {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "BGMprWMY8cXWf0kkCDXhf4edNL0FnHe2ovGq2XVcoiT70xAa250lzlHlbUfF-WkvwRhzdAEeW4lKEEbTTg5cNFM"
            });
            console.log("Push Subscription:", JSON.stringify(subscription));

            // Send subscription to server
            await fetch("/api/subscribe", {
                method: "POST",
                body: JSON.stringify(subscription),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("Push subscription sent to server.");
        } catch (error) {
            console.error("Error subscribing to push notifications:", error);
        }
    } else {
        console.error("Push API is not supported in this browser.");
    }
}


// Geolocation API
function requestUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`User's location: Latitude ${latitude}, Longitude ${longitude}`);
                showNotification(
                    "Location Detected",
                    `Latitude: ${latitude}, Longitude: ${longitude}`
                );
            },
            (error) => {
                console.error("Error fetching location:", error.message);
                showNotification("Location Access Denied", "Unable to retrieve your location.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
        showNotification("Geolocation Unsupported", "Your browser does not support location services.");
    }
}

// Initialize on Page Load
window.addEventListener("load", () => {
    if (Notification.permission === "default") {
        requestNotificationPermission();
    }
    requestUserLocation();
});

// Slideshow and Load More Features
document.addEventListener("DOMContentLoaded", () => {
    const mainPage = document.querySelector(".main-page");

    const handleScroll = () => {
        const sectionPosition = mainPage.getBoundingClientRect().top;
        const screenHeight = window.innerHeight;

        if (sectionPosition < screenHeight - 100) {
            mainPage.classList.add("visible");
        }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
});

function loadMoreImages() {
    const hiddenImages = document.querySelectorAll(".hidden-image");
    let revealedCount = 0;

    hiddenImages.forEach((image) => {
        if (revealedCount < 3) {
            image.classList.remove("hidden-image");
            image.classList.add("visible-image");
            revealedCount++;
        }
    });

    if (document.querySelectorAll(".hidden-image").length === 0) {
        const loadMoreBtn = document.getElementById("loadMoreBtn");
        loadMoreBtn.textContent = "All Images Loaded";
        loadMoreBtn.disabled = true;
    }
}

// Slideshow Functionality
const slides = document.querySelectorAll(".slide");
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, idx) => {
        slide.style.display = idx === index ? "block" : "none";
    });
}

function navigateSlides(direction) {
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    showSlide(currentSlide);
}

document.querySelector(".prev").addEventListener("click", () => navigateSlides(-1));
document.querySelector(".next").addEventListener("click", () => navigateSlides(1));
showSlide(currentSlide);
