// Firebase konfiqurasiyasını əlavə et
const firebaseConfig = {
    apiKey: "SENIN_API_KEY",
    authDomain: "SENIN_PROJECT_ID.firebaseapp.com",
    projectId: "SENIN_PROJECT_ID",
    storageBucket: "SENIN_PROJECT_ID.appspot.com",
    messagingSenderId: "SENIN_SENDER_ID",
    appId: "SENIN_APP_ID"
};

// Firebase-i initialize et
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Sifarişi Firestore-a yazan funksiya
function placeOrder(user, cart, tableNumber) {
    if (!user || cart.length === 0) {
        alert("Zəhmət olmasa giriş edin və səbətə məhsul əlavə edin!");
        return;
    }

    let addressInput = document.getElementById("user-address").value.trim();
    let orderData = {
        user: { ...user, address: addressInput },
        cart,
        table: tableNumber || "Masa seçilməyib",
        total: cart.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("orders").add(orderData)
        .then(() => {
            localStorage.removeItem(`cart_${user.id}`);
            alert("Sifariş təsdiq olundu!");
            location.reload(); // Səhifəni yenilə
        })
        .catch(error => {
            console.error("Sifariş göndərilmədi: ", error);
        });
}

// Orders səhifəsində real-time sifarişləri göstər
function loadOrders() {
    const ordersContainer = document.getElementById("orders-list");
    db.collection("orders").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        ordersContainer.innerHTML = "";
        snapshot.forEach(doc => {
            let order = doc.data();
            let orderElement = document.createElement("div");
            orderElement.classList.add("order-item");
            orderElement.innerHTML = `
                <p><strong>İstifadəçi:</strong> ${order.user.name} (${order.user.email})</p>
                <p><strong>Ünvan:</strong> ${order.user.address || "Ünvan yoxdur"}</p>
                <p><strong>Masa:</strong> ${order.table}</p>
                <p><strong>Toplam Məbləğ:</strong> ${order.total} AZN</p>
                <hr>
            `;
            ordersContainer.appendChild(orderElement);
        });
    });
}
