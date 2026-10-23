const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();

exports.createShopAndWorker = onCall(async (request) => {
  const data = request.data;
  const { shopName, workerEmail, workerPass, phone, address, ownerName, ownerEmail } = data;

  if (!shopName || !workerEmail || !workerPass) {
    throw new HttpsError("invalid-argument", "الرجاء إدخال كافة البيانات المطلوبة.");
  }

  try {
    // إنشاء حساب العامل في Firebase Authentication تلقائياً
    const userRecord = await admin.auth().createUser({
      email: workerEmail,
      password: workerPass,
      displayName: shopName,
    });

    // تجهيز بيانات الفرع وحفظها في Firestore
    const shopId = Date.now();
    const shopObj = {
      id: shopId,
      name: shopName,
      owner: ownerName,
      ownerEmail: ownerEmail,
      workerEmail: workerEmail,
      workerPass: workerPass,
      phone: phone || "+90 ...",
      address: address || "العنوان لم يحدد",
      code: "SHOP-" + Math.floor(100 + Math.random() * 900),
      status: "active",
      suspendedAt: null,
      authUid: userRecord.uid
    };

    await admin.firestore().collection("platformShops").doc(String(shopId)).set(shopObj);

    return { success: true, shopId: shopId, message: "تم إنشاء الحساب والفرع بنجاح!" };
  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});