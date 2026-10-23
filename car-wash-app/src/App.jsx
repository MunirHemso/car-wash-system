import React, { useState, useEffect } from 'react';
import { 
  Car, Shield, Clock, Users, Wrench, Lock, Unlock, 
  Search, CreditCard, Banknote, LogOut, Building, Plus, CheckCircle, Printer, FileText, Camera, Calendar, Phone, MapPin, Tag, User, Settings, DollarSign, BarChart3, Key, Mail, AlertTriangle, Trash2, Edit3, Image as ImageIcon, RefreshCw, Bike, Bell, CheckSquare, Award, UsersRound, FileSpreadsheet, UserPlus
} from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('carWash_currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('carWash_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('carWash_currentUser');
    }
  }, [currentUser]);

  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const [shops, setShops] = useState([
    { 
      id: 1, 
      name: 'مغسلة النسر - الفرع الرئيسي', 
      owner: 'أحمد محمد', 
      ownerEmail: 'ahmed@gmail.com',
      taxNumber: '1234567890',
      workerEmail: 'worker1@gmail.com',
      workerPass: '123456',
      phone: '+90 531 234 5678', 
      address: 'إسكندرون، شارع أتاتورك', 
      code: 'NESR-1', 
      status: 'active',
      subscriptionType: 'trial',
      subscriptionExpiry: '2026-11-01',
      suspendedAt: null
    }
  ]);

  // مزامنة المحلات والفروع سحابياً بشكل لحظي من Firestore
  useEffect(() => {
    const unsubShops = onSnapshot(collection(db, "platformShops"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedShops = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() }));
        setShops(fetchedShops);

        if (currentUser && currentUser.role === 'owner') {
          const updatedOwnedShops = fetchedShops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === currentUser.email.toLowerCase());
          setCurrentUser(prev => ({
            ...prev,
            ownedShops: updatedOwnedShops
          }));
        }
      } else {
        shops.forEach(async (s) => {
          await setDoc(doc(db, "platformShops", String(s.id)), s);
        });
      }
    });
    return () => unsubShops();
  }, []);

  const comprehensiveCarLibrary = [
    "فيات إيجيا (Fiat Egea)", "فيات لينيا (Fiat Linea)", "فيات پونتو (Fiat Punto)", "فيات دوبلو (Fiat Doblo)", "فيات فيورينو (Fiat Fiorino)", "فيات تيبو (Fiat Tipo)",
    "رينو ميجان (Renault Megane)", "رينو كليو (Renault Clio)", "رينو فلوينس (Renault Fluence)", "رينو سيمبول (Renault Symbol)", "رينو تاليسمان (Renault Talisman)", "رينو كابتشر (Renault Captur)",
    "فورد فوكس (Ford Focus)", "فورد فيستا (Ford Fiesta)", "فورد مونديو (Ford Mondeo)", "فورد كوجا (Ford Kuga)", "فورد ترانزيت (Ford Transit)", "فورد رينجر (Ford Ranger)",
    "تويوتا كورولا (Toyota Corolla)", "تويوتا يارس (Toyota Yaris)", "تويوتا كامري (Toyota Camry)", "تويوتا راف 4 (Toyota RAV4)", "تويوتا هيلوكس (Toyota Hilux)",
    "فولكس فاجن باسات (VW Passat)", "فولكس فاجن جولف (VW Golf)", "فولكس فاجن بولو (VW Polo)", "فولكس فاجن تيغوان (VW Tiguan)", "فولكس فاجن جِتا (VW Jetta)",
    "هيونداي أكسنت (Hyundai Accent)", "هيونداي إلنترا (Hyundai Elantra)", "هيونداي توسان (Hyundai Tucson)", "هيونداي آي 20 (Hyundai i20)", "هيونداي سانتافي (Hyundai Santa Fe)",
    "كيا سبورتاج (Kia Sportage)", "كيا سيراتو (Kia Cerato)", "كيا ريو (Kia Rio)", "كيا سورينتو (Kia Sorento)", "كيا بيكانتو (Kia Picanto)",
    "هوندا سيبيك (Honda Civic)", "هوندا أكورد (Honda Accord)", "هوندا سي آر في (Honda CR-V)",
    "بي إم دبليو الفئة الثالثة (BMW 3 Series)", "بي إم دبليو الفئة الخامسة (BMW 5 Series)", "بي إم دبليو إكس 3 (BMW X3)",
    "مرسيدس الفئة C (Mercedes C-Class)", "مرسيدس الفئة E (Mercedes E-Class)", "مرسيدس جي إل سي (Mercedes GLC)",
    "سكودا أوكتافيا (Skoda Octavia)", "سكودا سوبيرب (Skoda Superb)", "سكودا كودياك (Skoda Kodiaq)",
    "داسيا دستر (Dacia Duster)", "داسيا سانديرو (Sandero)",
    "بيجو 3008 (Peugeot 3008)", "بيجو 208 (Peugeot 208)",
    "أوبل أسترا (Opel Astra)", "أوبل كورسا (Opel Corsa)",
    "نيسان قشقاي (Nissan Qashqai)", "نيسان صني (Nissan Sunny)",
    "توج تي 10 إكس (Togg T10X)"
  ];

  const [transactions, setTransactions] = useState({});
  const [expenses, setExpenses] = useState({});
  const [debts, setDebts] = useState({});
  const [debtRepayments, setDebtRepayments] = useState({});
  const [announcements, setAnnouncements] = useState({});

  useEffect(() => {
    const unsubscribes = [];

    shops.forEach(shop => {
      const shopIdStr = String(shop.id);
      
      const txRef = collection(db, "shops", shopIdStr, "transactions");
      unsubscribes.push(onSnapshot(txRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(prev => ({ ...prev, [shop.id]: list }));
      }));

      const expRef = collection(db, "shops", shopIdStr, "expenses");
      unsubscribes.push(onSnapshot(expRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpenses(prev => ({ ...prev, [shop.id]: list }));
      }));

      const debtRef = collection(db, "shops", shopIdStr, "debts");
      unsubscribes.push(onSnapshot(debtRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDebts(prev => ({ ...prev, [shop.id]: list }));
      }));

      const repRef = collection(db, "shops", shopIdStr, "debtRepayments");
      unsubscribes.push(onSnapshot(repRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDebtRepayments(prev => ({ ...prev, [shop.id]: list }));
      }));

      const annRef = collection(db, "shops", shopIdStr, "announcements");
      unsubscribes.push(onSnapshot(annRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAnnouncements(prev => ({ ...prev, [shop.id]: list }));
      }));
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [shops]);

  const [selectedShopId, setSelectedShopId] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [programmerTab, setProgrammerTab] = useState('clients'); 
  const [selectedClientEmail, setSelectedClientEmail] = useState(null);

  // حقول إضافة عميل جديد
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientTax, setNewClientTax] = useState('');
  const [newClientShopName, setNewClientShopName] = useState('');
  const [newClientWorkerEmail, setNewClientWorkerEmail] = useState('');
  const [newClientWorkerPass, setNewClientWorkerPass] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const [newShopName, setNewShopName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPass, setNewWorkerPass] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [ownerTaxNumber, setOwnerTaxNumber] = useState('');
  const [editingShop, setEditingShop] = useState(null);

  const [ownerNoticeTitle, setOwnerNoticeTitle] = useState('');
  const [ownerNoticeText, setOwnerNoticeText] = useState('');
  const [announcementDate, setAnnouncementDate] = useState(new Date().toISOString().slice(0, 10));

  const [vehicleCategory, setVehicleCategory] = useState('سيارة');
  const [carModel, setCarModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [serviceType, setServiceType] = useState('غسيل خارجي وداخلي');
  const [price, setPrice] = useState('');
  const [payMethod, setPayMethod] = useState('كاش');
  const [debtorName, setDebtorName] = useState('');
  const [debtorPhone, setDebtorPhone] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:45');
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [editingTxId, setEditingTxId] = useState(null);

  const [settlingDebtId, setSettlingDebtId] = useState(null);
  const [repayMethod, setRepayMethod] = useState('كاش');
  const [repayNotes, setRepayNotes] = useState('');
  const [repayDate, setRepayDate] = useState(new Date().toISOString().slice(0, 10));

  const [expCategory, setExpCategory] = useState('غذاء وضيافة');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert('تم تحديث القوائم وجلب أحدث البيانات بنجاح! 🔄✨');
    }, 600);
  };

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    if (!inputEmail || !inputPassword) return alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور');

    try {
      if (inputEmail.toLowerCase() === "munir@gmail.com") {
        try { await signInWithEmailAndPassword(auth, inputEmail, inputPassword); } catch (e) {}
        setCurrentUser({ email: inputEmail, role: 'programmer', name: 'المبرمج (المدير العام)' });
        return;
      }

      const ownedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === inputEmail.toLowerCase());
      if (ownedShops.length > 0) {
        const activeOrValidShops = ownedShops.filter(s => s.status !== 'suspended');
        if (activeOrValidShops.length === 0) {
          alert('عذراً، حسابك موقوف أو انتهت صلاحية اشتراكه. يرجى مراجعة الإدارة!');
          return;
        }

        try { await signInWithEmailAndPassword(auth, inputEmail, inputPassword); } catch (e) {}
        const userData = {
          email: inputEmail,
          role: 'owner',
          ownerName: ownedShops[0].owner,
          taxNumber: ownedShops[0].taxNumber || 'غير مسجل',
          ownedShops: ownedShops
        };
        setCurrentUser(userData);
        const activeFirst = activeOrValidShops[0] || ownedShops[0];
        setSelectedShopId(activeFirst.id);
        return;
      }

      const targetShop = shops.find(s => s.workerEmail && s.workerEmail.toLowerCase() === inputEmail.toLowerCase() && s.workerPass === inputPassword);
      if (targetShop) {
        if (targetShop.status === 'suspended') {
          alert('عذراً، هذا الفرع معلق أو انتهى اشتراكه من قبل الإدارة!');
          return;
        }
        const workerData = {
          email: inputEmail,
          role: 'worker',
          shopId: targetShop.id,
          shopName: targetShop.name,
          shopInfo: targetShop
        };
        setCurrentUser(workerData);
        return;
      }

      alert('البريد الإلكتروني أو كلمة المرور غير صحيحة!');
    } catch (error) {
      console.error(error);
      alert('فشل تسجيل الدخول: تأكد من صحة البيانات المدخلة.');
    }
  };

  const handleForgotPassword = async () => {
    if (!inputEmail) {
      alert('الرجاء كتابة بريدك الإلكتروني في حقل الإيميل أولاً!');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, inputEmail);
      alert('تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني بنجاح. 📧');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ، تأكد من أن البريد الإلكتروني مسجل بشكل صحيح في النظام.');
    }
  };

  // 🚀 إضافة عميل جديد مع فترة تجريبية 7 أيام تلقائياً
  const handleProgrammerAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail || !newClientShopName || !newClientWorkerEmail || !newClientWorkerPass) {
      return alert('يرجى تعبئة الحقول الأساسية للعميل وفرعه الأول!');
    }

    try {
      const shopId = Date.now();
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7); // فترة تجريبية 7 أيام منذ الإنشاء

      const newClientShopObj = {
        id: shopId,
        name: newClientShopName,
        owner: newClientName,
        ownerEmail: newClientEmail,
        taxNumber: newClientTax || 'غير مسجل',
        workerEmail: newClientWorkerEmail,
        workerPass: newClientWorkerPass,
        phone: newClientPhone || '+90 ...',
        address: newClientAddress || 'العنوان لم يحدد',
        code: 'SHOP-' + Math.floor(100 + Math.random() * 900),
        status: 'active',
        subscriptionType: 'trial',
        subscriptionExpiry: trialExpiry.toISOString().slice(0, 10),
        suspendedAt: null
      };

      await setDoc(doc(db, "platformShops", String(shopId)), newClientShopObj);

      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientTax('');
      setNewClientShopName('');
      setNewClientWorkerEmail('');
      setNewClientWorkerPass('');
      setNewClientAddress('');

      alert('تم إضافة العميل الجديد بنجاح، ومَنحه فترة تجريبية مجانية لمدة 7 أيام! 🌟⏳');
      setProgrammerTab('clients');
    } catch (error) {
      alert('حدث خطأ أثناء إضافة العميل: ' + error.message);
    }
  };

  const handleUpdateClientSubscription = async (clientEmail, planType) => {
    let expiryDate = '';
    const now = new Date();

    if (planType === 'monthly') {
      now.setDate(now.getDate() + 30);
      expiryDate = now.toISOString().slice(0, 10);
    } else if (planType === 'yearly') {
      now.setFullYear(now.getFullYear() + 1);
      expiryDate = now.toISOString().slice(0, 10);
    } else if (planType === 'lifetime') {
      expiryDate = 'مدى الحياة ♾️';
    }

    try {
      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          subscriptionType: planType,
          subscriptionExpiry: expiryDate,
          status: 'active',
          suspendedAt: null
        });
      }
      alert(`تم تجديد اشتراك العميل (${clientEmail}) بنجاح لجميع فروعه (${clientShops.length} فروع)! 🌟✨`);
    } catch (e) {
      alert('حدث خطأ أثناء تجديد الاشتراك.');
    }
  };

  const handleSuspendShop = async (shopId) => {
    if (!window.confirm('هل أنت متأكد من تعليق هذا الفرع وإيقاف اشتراكه؟')) return;
    try {
      await updateDoc(doc(db, "platformShops", String(shopId)), {
        status: 'suspended',
        suspendedAt: new Date().toISOString()
      });
      alert('تم تعليق المحل وإيقاف اشتراكه بنجاح.');
    } catch (e) {
      alert('حدث خطأ أثناء تعليق الفرع.');
    }
  };

  const handleActivateShop = async (shopId) => {
    try {
      await updateDoc(doc(db, "platformShops", String(shopId)), {
        status: 'active',
        suspendedAt: null
      });
      alert('تم تفعيل الفرع بنجاح!');
    } catch (e) {
      alert('حدث خطأ أثناء تفعيل الفرع.');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!ownerNoticeTitle || !ownerNoticeText || selectedShopId === 'all') return alert('الرجاء اختيار فرع محدد وتعبئة العنوان ونَص الملاحظة');
    
    try {
      await addDoc(collection(db, "shops", String(selectedShopId), "announcements"), {
        title: ownerNoticeTitle,
        text: ownerNoticeText,
        date: announcementDate
      });
      setOwnerNoticeTitle('');
      setOwnerNoticeText('');
      alert('تم نشر التنبيه بنجاح للعامل في الفرع! 📢✨');
    } catch (error) {
      alert('حدث خطأ أثناء نشر التنبيه.');
    }
  };

  const handleDeleteAnnouncement = async (shopId, annId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التنبيه؟')) return;
    try {
      await deleteDoc(doc(db, "shops", String(shopId), "announcements", String(annId)));
      alert('تم حذف التنبيه بنجاح.');
    } catch (error) {}
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX = 300;

          if (width > height) {
            if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
          } else {
            if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.5);

          if (type === 'before') setBeforePhoto(compressed);
          if (type === 'after') setAfterPhoto(compressed);
        } catch (err) {
          alert('خطأ في معالجة الصورة.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePrintInvoice = (inv) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('يرجى السماح بفتح النوافذ المنبثقة.');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - ${inv.plate}</title>
        <style>
          body { font-family: Tahoma, sans-serif; padding: 20px; text-align: right; }
          .box { max-width: 400px; margin: auto; border: 2px solid #000; padding: 20px; border-radius: 10px; }
          .center { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 10px; margin-bottom: 15px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .total { background: #e0f2fe; padding: 10px; text-align: center; font-weight: bold; margin-top: 15px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="center">
            <h2>🏪 ${inv.shopName}</h2>
            <p>${inv.shopInfo?.address || 'إسكندرون'} | هاتف: ${inv.shopInfo?.phone || '+90...'}</p>
          </div>
          <div class="row"><span>المركبة:</span><strong>${inv.vehicleCategory} (${inv.carModel || ''})</strong></div>
          <div class="row"><span>اللوحة:</span><strong>${inv.plate}</strong></div>
          <div class="row"><span>الخدمة:</span><strong>${inv.service}</strong></div>
          <div class="row"><span>الدفع:</span><strong>${inv.method}</strong></div>
          <div class="total">الإجمالي: ${inv.price} ليرة</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) {}
    localStorage.removeItem('carWash_currentUser');
    setCurrentUser(null);
    setSelectedInvoice(null);
  };

  // 🚀 إضافة فرع جديد من قبل صاحب المحل مع 7 أيام تجريبية تلقائياً
  const handleOwnerAddShop = async (e) => {
    e.preventDefault();
    if (!newShopName || !newWorkerEmail || !newWorkerPass) return alert('يرجى تعبئة اسم المحل وإيميل وكلمة سر العامل');

    try {
      const shopId = Date.now();
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7); // فترة تجريبية 7 أيام للفرع الجديد أيضاً

      const shopObj = {
        id: shopId,
        name: newShopName,
        owner: currentUser.ownerName,
        ownerEmail: currentUser.email,
        taxNumber: currentUser.taxNumber || ownerTaxNumber || 'غير مسجل',
        workerEmail: newWorkerEmail,
        workerPass: newWorkerPass,
        phone: newShopPhone || '+90 ...',
        address: newShopAddress || 'العنوان لم يحدد',
        code: 'SHOP-' + Math.floor(100 + Math.random() * 900),
        status: 'active',
        subscriptionType: 'trial',
        subscriptionExpiry: trialExpiry.toISOString().slice(0, 10),
        suspendedAt: null
      };

      await setDoc(doc(db, "platformShops", String(shopId)), shopObj);

      const updatedOwnedShops = [...(currentUser.ownedShops || []), shopObj];
      setCurrentUser(prev => ({
        ...prev,
        ownedShops: updatedOwnedShops
      }));

      setNewShopName('');
      setNewWorkerEmail('');
      setNewWorkerPass('');
      setNewShopPhone('');
      setNewShopAddress('');
      setSelectedShopId(shopId);
      
      alert('تم إضافة الفرع الجديد بنجاح ومنحه 7 أيام تجريبية مجانية! 🏪✨');
      setActiveTab('dashboard');
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ: ' + error.message);
    }
  };

  const handleDeleteTransactionByOwner = async (shopId, txId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه العملية؟')) return;
    try { await deleteDoc(doc(db, "shops", String(shopId), "transactions", String(txId))); alert('تم الحذف بنجاح'); } catch (e) {}
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!plateNumber || !price || !currentUser) return alert('أدخل اللوحة والسعر!');
    const shopId = currentUser.role === 'worker' ? currentUser.shopId : selectedShopId;
    if (!shopId || shopId === 'all') return alert('اختر محلاً محدداً');

    try {
      await addDoc(collection(db, "shops", String(shopId), "transactions"), {
        vehicleCategory, carModel: vehicleCategory === 'سيارة' ? carModel : 'دراجة نارية', plate: plateNumber, service: serviceType, price: Number(price), paid: payMethod === 'دين' ? 0 : Number(price), method: payMethod, notes: txNotes, startTime, endTime, date: new Date().toISOString().slice(0, 10), beforePhoto, afterPhoto
      });
      if (payMethod === 'دين') {
        await addDoc(collection(db, "shops", String(shopId), "debts"), {
          debtorName, phone: debtorPhone, service: serviceType, amount: Number(price), date: new Date().toISOString().slice(0, 10), addedBy: 'عامل الفرع'
        });
        setDebtorName(''); setDebtorPhone('');
      }
      alert('تم تسجيل الطلب بنجاح! 🚗✨');
      setPlateNumber(''); setCarModel(''); setPrice(''); setTxNotes(''); setBeforePhoto(null); setAfterPhoto(null);
    } catch (e) { alert('خطأ: ' + e.message); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expTitle || !expAmount || !selectedShopId) return alert('أدخل بيانات المصروف');
    try {
      await addDoc(collection(db, "shops", String(selectedShopId), "expenses"), {
        category: expCategory, title: expTitle, amount: Number(expAmount), notes: expNotes, time: new Date().toLocaleTimeString()
      });
      setExpTitle(''); setExpAmount(''); setExpNotes('');
      alert('تم تسجيل المصروف بنجاح 📉');
    } catch (e) { alert('خطأ'); }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto shadow-inner"><Car size={40} /></div>
          <div className="text-center"><h2 className="text-2xl font-black text-gray-800">نظام إدارة المغاسل السحابي</h2><p className="text-gray-500 text-sm mt-1">سجل دخولك عبر النظام السحابي الآمن</p></div>
          <form onSubmit={handleFirebaseLogin} className="space-y-4">
            <div><label className="block text-xs font-bold text-gray-600 mb-1">البريد الإلكتروني</label><input type="email" value={inputEmail} onChange={e => setInputEmail(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm text-gray-900" required /></div>
            <div>
              <div className="flex justify-between items-center mb-1"><label className="block text-xs font-bold text-gray-600">كلمة المرور</label><button type="button" onClick={handleForgotPassword} className="text-xs text-blue-600">نسيت كلمة المرور؟</button></div>
              <input type="password" value={inputPassword} onChange={e => setInputPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm text-gray-900" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm cursor-pointer shadow-lg">تسجيل الدخول الآمن 🚀</button>
          </form>
        </div>
      </div>
    );
  }

  // ================= 🌟 واجهة المبرمج الاحترافية (تجميع العملاء بعرض كم فرع لديهم وكشف الحسابات العام للعملاء) =================
  if (currentUser.role === 'programmer') {
    const clientsMap = {};
    shops.forEach(s => {
      const email = s.ownerEmail ? s.ownerEmail.toLowerCase() : 'unknown@domain.com';
      if (!clientsMap[email]) {
        clientsMap[email] = {
          ownerName: s.owner || 'غير محدد',
          ownerEmail: email,
          taxNumber: s.taxNumber || 'غير مسجل',
          phone: s.phone || '+90...',
          shopsList: []
        };
      }
      clientsMap[email].shopsList.push(s);
    });

    const clientsList = Object.values(clientsMap);
    const activeShopsCount = shops.filter(s => s.status === 'active').length;
    const suspendedShopsCount = shops.filter(s => s.status === 'suspended').length;
    const selectedClient = clientsList.find(c => c.ownerEmail === selectedClientEmail);

    return (
      <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
        <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-purple-400" size={24} />
            <span className="font-bold text-white text-lg">لوحة المدير العام (إدارة عملاء المنصة والاشتراكات)</span>
          </div>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-1">
            <LogOut size={14} /> خروج
          </button>
        </header>

        <nav className="bg-white border-b px-6 py-3 flex gap-6 text-sm font-bold">
          <button onClick={() => { setProgrammerTab('clients'); setSelectedClientEmail(null); }} className={`pb-2 border-b-2 cursor-pointer ${programmerTab === 'clients' && !selectedClientEmail ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-700'}`}>
            👥 عملاء المنصة (أصحاب المحلات)
          </button>
          <button onClick={() => { setProgrammerTab('addClient'); setSelectedClientEmail(null); }} className={`pb-2 border-b-2 cursor-pointer ${programmerTab === 'addClient' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-700'}`}>
            ➕ إضافة عميل جديد للنظام
          </button>
          <button onClick={() => { setProgrammerTab('subscriptionsReport'); setSelectedClientEmail(null); }} className={`pb-2 border-b-2 cursor-pointer ${programmerTab === 'subscriptionsReport' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-700'}`}>
            📑 كشف حسابات الاشتراكات العامة
          </button>
        </nav>

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-gray-500 text-sm">إجمالي العملاء (أصحاب المحلات)</span>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{clientsList.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
              <span className="text-gray-500 text-sm">إجمالي الفروع في المنصة</span>
              <h3 className="text-3xl font-black text-blue-600 mt-1">{shops.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
              <span className="text-gray-500 text-sm">الفروع النشطة</span>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{activeShopsCount}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
              <span className="text-gray-500 text-sm">الفروع الموقوفة/المنتهية</span>
              <h3 className="text-3xl font-black text-red-600 mt-1">{suspendedShopsCount}</h3>
            </div>
          </div>

          {/* تبويب 1: عرض قائمة العملاء */}
          {programmerTab === 'clients' && !selectedClient && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <UsersRound className="text-purple-600" size={22} /> قائمة عملاء المنصة (أصحاب المحلات وعدد فروعهم)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientsList.map((client, idx) => {
                  const clientActiveShops = client.shopsList.filter(s => s.status === 'active').length;
                  return (
                    <div key={idx} className="p-5 rounded-2xl border bg-gray-50 hover:bg-purple-50/30 transition flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-lg text-slate-900">👤 {client.ownerName}</h4>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-xl shadow-xs">
                            🏢 {client.shopsList.length} فروع مغاسل
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">📧 الإيميل: {client.ownerEmail}</p>
                        <p className="text-xs text-gray-600">📞 الهاتف: {client.phone}</p>
                        <p className="text-xs text-gray-600">🏛️ الرقم الضريبي: <span className="font-bold text-slate-800">{client.taxNumber}</span></p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-xs font-bold text-emerald-600">الفروع النشطة: {clientActiveShops} من {client.shopsList.length}</span>
                        <button 
                          onClick={() => setSelectedClientEmail(client.ownerEmail)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          عرض الملف الكامل وفروعه 🔍
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* تبويب 2: إضافة عميل جديد للنظام مع 7 أيام تجريبية */}
          {programmerTab === 'addClient' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl"><UserPlus size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">إضافة عميل جديد للنظام (صاحب مغاسل جديد)</h3>
                  <p className="text-xs text-gray-500">سيحصل العميل تلقائياً على فترة تجريبية مجانية لمدة 7 أيام منذ لحظة الإنشاء</p>
                </div>
              </div>

              <form onSubmit={handleProgrammerAddClient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم العميل الكامل (صاحب المحل) *</label>
                    <input type="text" placeholder="مثال: خالد أحمد" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني للعميل (Gmail) *</label>
                    <input type="email" placeholder="khaled@gmail.com" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم هاتف العميل</label>
                    <input type="text" placeholder="+90 500 000 0000" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الرقم الضريبي / المعرف الضريبي</label>
                    <input type="text" placeholder="الرقم الضريبي للمؤسسة" value={newClientTax} onChange={e => setNewClientTax(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-bold text-sm text-purple-700">تفاصيل الفرع الأول لهذا العميل:</h4>
                  <input type="text" placeholder="اسم الفرع الأول (مثال: مغسلة النور - الفرع الرئيسي) *" value={newClientShopName} onChange={e => setNewClientShopName(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">إيميل العامل للفرع *</label>
                      <input type="email" placeholder="worker.khaled@gmail.com" value={newClientWorkerEmail} onChange={e => setNewClientWorkerEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">كلمة سر العامل *</label>
                      <input type="password" placeholder="••••••••" value={newClientWorkerPass} onChange={e => setNewClientWorkerPass(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                    </div>
                  </div>

                  <input type="text" placeholder="عنوان الفرع (المنطقة والشارع)" value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" />
                </div>

                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md">تسجيل العميل الجديد ومنحه 7 أيام تجريبية 🚀</button>
              </form>
            </div>
          )}

          {/* الملف الشخصي والضريبي التفصيلي للعميل المحدد */}
          {selectedClient && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase">ملف العميل التجاري والضريبي</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">👤 {selectedClient.ownerName}</h2>
                </div>
                <button 
                  onClick={() => setSelectedClientEmail(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  العودة لقائمة العملاء 🔙
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                <div>
                  <span className="text-xs text-gray-500 block">البريد الإلكتروني الرئيسي</span>
                  <strong className="text-sm text-slate-900">{selectedClient.ownerEmail}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">رقم الهاتف</span>
                  <strong className="text-sm text-slate-900">{selectedClient.phone}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">المعرف / الرقم الضريبي</span>
                  <strong className="text-sm text-purple-700 font-mono text-base">{selectedClient.taxNumber}</strong>
                </div>
              </div>

              <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-sm">تجديد اشتراكات جميع فروع هذا العميل دفعة واحدة:</h4>
                  <p className="text-xs text-gray-300">يملك هذا العميل {selectedClient.shopsList.length} فرعاً مسجلاً في المنصة.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleUpdateClientSubscription(selectedClient.ownerEmail, 'monthly')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    تجديد شهري للكل 🗓️
                  </button>
                  <button onClick={() => handleUpdateClientSubscription(selectedClient.ownerEmail, 'yearly')} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    تجديد سنوي للكل 📅
                  </button>
                  <button onClick={() => handleUpdateClientSubscription(selectedClient.ownerEmail, 'lifetime')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    مدى الحياة للكل ♾️
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-base">فروع المغاسل التابعة لهذا العميل ({selectedClient.shopsList.length}):</h4>
                {selectedClient.shopsList.map(shop => (
                  <div key={shop.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${shop.status === 'suspended' ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-gray-900">🏪 {shop.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${shop.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {shop.status === 'active' ? 'نشط' : 'موقوف'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">📍 العنوان: {shop.address} | الهاتف: {shop.phone}</p>
                      <p className="text-xs text-gray-600">👷‍♂️ إيميل العامل: {shop.workerEmail} (باسورد: {shop.workerPass})</p>
                      <div className="mt-1 text-xs font-bold text-blue-600">
                        الاشتراك: {shop.subscriptionType === 'trial' ? '⏳ تجريبي (7 أيام)' : shop.subscriptionType} | ينتهي في: {shop.subscriptionExpiry || 'غير محدد'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {shop.status === 'active' ? (
                        <button onClick={() => handleSuspendShop(shop.id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                          إيقاف الفرع
                        </button>
                      ) : (
                        <button onClick={() => handleActivateShop(shop.id)} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                          تفعيل الفرع
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تبويب 3: كشف حسابات الاشتراكات العامة (يعرض العملاء وعدد فروعهم بانتظام) */}
          {programmerTab === 'subscriptionsReport' && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <FileSpreadsheet className="text-purple-600" size={22} /> كشف حسابات الاشتراكات والوضع المالي للمنصة
              </h3>
              <p className="text-xs text-gray-500">سجل بجميع العملاء (أصحاب المحلات) وعدد فروعهم وحالة اشتراكاتهم لتتبع إيراداتك بانتظام.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="p-3">صاحب المحل (العميل)</th>
                      <th className="p-3">الرقم الضريبي</th>
                      <th className="p-3">عدد الفروع المملوكة</th>
                      <th className="p-3">نوع الاشتراك العام</th>
                      <th className="p-3">تاريخ انتهاء الاشتراك</th>
                      <th className="p-3">الحالة العامة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clientsList.map((client, idx) => {
                      const firstShop = client.shopsList[0] || {};
                      const hasActiveShop = client.shopsList.some(s => s.status === 'active');
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3 font-bold text-slate-900">👤 {client.ownerName} <span className="text-xs text-gray-500 block font-normal">{client.ownerEmail}</span></td>
                          <td className="p-3 font-mono">{client.taxNumber}</td>
                          <td className="p-3 font-bold text-purple-700">🏢 {client.shopsList.length} فروع</td>
                          <td className="p-3 font-semibold text-blue-600">{firstShop.subscriptionType === 'trial' ? '⏳ تجريبي (7 أيام)' : firstShop.subscriptionType === 'yearly' ? 'سنوي 📅' : firstShop.subscriptionType === 'lifetime' ? 'مدى الحياة ♾️' : 'شهري 🗓️'}</td>
                          <td className="p-3 font-mono">{firstShop.subscriptionExpiry || 'غير محدد'}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${hasActiveShop ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {hasActiveShop ? 'نشط' : 'منتهي / موقوف'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ================= شاشة العامل =================
  if (currentUser.role === 'worker') {
    const shopId = currentUser.shopId;
    const shopTx = transactions[shopId] || [];
    const shopDebts = debts[shopId] || [];
    const shopAnnouncementsList = announcements[shopId] || [];

    return (
      <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div><h1 className="font-bold text-white text-lg">{currentUser.shopName}</h1><span className="text-xs text-cyan-300">شاشة العامل</span></div>
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1.5 rounded-xl text-xs font-bold text-white">خروج</button>
        </header>
        <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          {shopAnnouncementsList.map(ann => (
            <div key={ann.id} className="bg-amber-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-md">
              <Bell size={22} /><div><h4 className="font-black text-sm">{ann.title}</h4><p className="text-xs">{ann.text}</p></div>
            </div>
          ))}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
              <h3 className="font-bold text-gray-800"><Car className="inline ml-1 text-blue-600" /> {editingTxId ? 'تعديل غسيل' : 'تسجيل غسيل جديد'}</h3>
              <form onSubmit={handleAddTransaction} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setVehicleCategory('سيارة')} className={`py-2 text-xs font-bold rounded-xl border ${vehicleCategory === 'سيارة' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>سيارة</button>
                  <button type="button" onClick={() => setVehicleCategory('موتور')} className={`py-2 text-xs font-bold rounded-xl border ${vehicleCategory === 'موتور' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>موتور</button>
                </div>
                {vehicleCategory === 'سيارة' && (
                  <input type="text" list="carModelsLibrary" placeholder="موديل السيارة *" value={carModel} onChange={e => setCarModel(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                )}
                <datalist id="carModelsLibrary">{comprehensiveCarLibrary.map((c, i) => <option key={i} value={c} />)}</datalist>
                <input type="text" placeholder="رقم اللوحة *" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 uppercase font-bold" required />
                <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                  <option>غسيل خارجي فقط</option><option>غسيل خارجي وداخلي</option><option>غسيل كامل مع تلميع</option>
                </select>
                <input type="number" placeholder="السعر (ليرة) *" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-black" required />
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPayMethod('كاش')} className={`py-2 text-xs font-bold rounded-xl border ${payMethod === 'كاش' ? 'bg-emerald-600 text-white' : 'bg-gray-50'}`}>كاش</button>
                  <button type="button" onClick={() => setPayMethod('بنك')} className={`py-2 text-xs font-bold rounded-xl border ${payMethod === 'بنك' ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>بنك</button>
                  <button type="button" onClick={() => setPayMethod('دين')} className={`py-2 text-xs font-bold rounded-xl border ${payMethod === 'دين' ? 'bg-red-600 text-white' : 'bg-gray-50'}`}>دين</button>
                </div>
                {payMethod === 'دين' && (
                  <div className="bg-red-50 p-3 rounded-xl border space-y-2">
                    <input type="text" placeholder="اسم الزبون *" value={debtorName} onChange={e => setDebtorName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs text-gray-900" required />
                    <input type="text" placeholder="هاتف الزبون *" value={debtorPhone} onChange={e => setDebtorPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs text-gray-900" required />
                  </div>
                )}
                <button type="submit" className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold text-sm">حفظ الطلب والتحديث 🚀</button>
              </form>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-3">
                <h3 className="font-bold text-gray-800">المركبات المسجلة اليوم</h3>
                {shopTx.map(t => (
                  <div key={t.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-sm border">
                    <div><span className="font-bold text-blue-600">{t.carModel || t.vehicleCategory} | لوحة: {t.plate}</span><p className="text-xs text-gray-500">{t.service} - {t.price} ليرة ({t.method})</p></div>
                    <button onClick={() => setSelectedInvoice({ ...t, shopName: currentUser.shopName, shopInfo: currentUser.shopInfo })} className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"><Printer size={14} /> طباعة</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ================= لوحة صاحب المحل (المالك) =================
  const ownedShops = currentUser.ownedShops || [];
  const currentShop = ownedShops.find(s => s.id === Number(selectedShopId)) || ownedShops[0];
  const isAllShops = selectedShopId === 'all';
  const targetShopIds = isAllShops ? ownedShops.map(s => s.id) : [Number(selectedShopId)];

  let totalRevenueAll = 0;
  let totalExpensesAll = 0;
  let totalCashAll = 0;
  let totalBankAll = 0;
  let totalVehiclesAll = 0;
  let totalDebtsAll = 0;
  let activeShopsCount = ownedShops.filter(s => s.status === 'active').length;
  let allShopsDebtsList = [];

  targetShopIds.forEach(id => {
    const txList = transactions[id] || [];
    const expList = expenses[id] || [];
    const debtList = debts[id] || [];
    const repList = debtRepayments[id] || [];

    const rev = txList.reduce((acc, t) => acc + Number(t.paid), 0) + repList.reduce((acc, r) => acc + Number(r.amount), 0);
    const exp = expList.reduce((acc, e) => acc + Number(e.amount), 0);
    
    totalRevenueAll += rev;
    totalExpensesAll += exp;
    
    const cashFromTx = txList.filter(t => t.method === 'كاش').reduce((acc, t) => acc + Number(t.paid), 0);
    const cashFromRepay = repList.filter(r => r.method === 'كاش').reduce((acc, r) => acc + Number(r.amount), 0);
    totalCashAll += (cashFromTx + cashFromRepay - exp);

    const bankFromTx = txList.filter(t => t.method === 'بنك').reduce((acc, t) => acc + Number(t.paid), 0);
    const bankFromRepay = repList.filter(r => r.method === 'بنك').reduce((acc, r) => acc + Number(r.amount), 0);
    totalBankAll += (bankFromTx + bankFromRepay);

    totalVehiclesAll += txList.length;

    debtList.forEach(d => {
      totalDebtsAll += Number(d.amount);
      allShopsDebtsList.push({ ...d, shopName: shops.find(s => s.id === id)?.name || '' });
    });
  });

  const netProfit = totalRevenueAll - totalExpensesAll;
  const currentShopExpenses = expenses[selectedShopId] || [];
  const currentShopTx = transactions[selectedShopId] || [];
  const currentShopDebts = debts[selectedShopId] || [];
  const shopRepayList = debtRepayments[selectedShopId] || [];
  const shopAnnouncementsList = announcements[selectedShopId] || [];

  const shopTotalServices = currentShopTx.reduce((acc, t) => acc + Number(t.price), 0);
  const shopTotalPaid = currentShopTx.reduce((acc, t) => acc + Number(t.paid), 0) + shopRepayList.reduce((acc, r) => acc + Number(r.amount), 0);
  const shopTotalDebtAmount = currentShopDebts.reduce((acc, d) => acc + Number(d.amount), 0);
  const shopTotalExpenses = currentShopExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const shopNetProfit = shopTotalPaid - shopTotalExpenses;

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      <header className="bg-slate-900 text-white p-4 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/20 p-2 rounded-xl text-cyan-400"><Building size={22} /></div>
          <div>
            <h1 className="font-bold text-white text-base">لوحة تحكم المالك: {currentUser.ownerName} | الرقم الضريبي: {currentUser.taxNumber}</h1>
            <span className="text-xs text-cyan-300 font-medium">إدارة المحلات والفروع المتعددة، والديون</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={selectedShopId || ''} 
            onChange={e => setSelectedShopId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold border border-slate-700 outline-none"
          >
            {ownedShops.map(s => <option key={s.id} value={s.id}>🏪 {s.name} {s.status === 'suspended' ? '(معلق/منتهي الاشتراك)' : ''}</option>)}
            <option value="all">📊 تقرير الجمع الشامل لجميع فروعي ({ownedShops.length} فرع)</option>
          </select>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-1"><LogOut size={14} /> خروج</button>
        </div>
      </header>

      <nav className="bg-white border-b px-6 py-3 flex gap-4 text-sm font-bold">
        <button onClick={() => setActiveTab('dashboard')} className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-700'}`}>📊 نظرة عامة والجرد</button>
        <button onClick={() => setActiveTab('addShop')} className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'addShop' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-700'}`}>➕ إضافة فرع جديد لفروعي</button>
        {!isAllShops && <button onClick={() => setActiveTab('accounting')} className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'accounting' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-700'}`}>📑 كشف الحسابات والديون والأرباح</button>}
        <button onClick={() => setActiveTab('profile')} className={`pb-2 border-b-2 cursor-pointer ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-700'}`}>⚙️ الملف الشخصي والضريبي</button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex justify-between items-center">
              <div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">الفرع النشط حالياً</span>
                <h2 className="text-2xl font-black text-white mt-1">{isAllShops ? `تقرير الجمع الشامل لجميع فروعك (${ownedShops.length} فروع)` : currentShop?.name}</h2>
                <p className="text-xs text-gray-300 mt-1">📍 {isAllShops ? `عدد الفروع النشطة: ${activeShopsCount} من أصل ${ownedShops.length} فرع` : currentShop?.address}</p>
                {currentShop?.status === 'suspended' && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold">هذا الفرع موقوف / انتهى اشتراكه. يرجى التواصل مع الإدارة للتجديد!</span>
                )}
              </div>
              <div className="text-left bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <span className="text-xs text-blue-200 block">صافي الأرباح الكلي</span>
                <span className="text-3xl font-black text-emerald-400">{netProfit} ليرة</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
                <span className="text-gray-500 text-sm">صندوق الكاش 💵</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalCashAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
                <span className="text-gray-500 text-sm">حساب البنك / الشبكة 💳</span>
                <h3 className="text-2xl font-black text-blue-600 mt-1">{totalBankAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100">
                <span className="text-gray-500 text-sm">إجمالي الديون المعلقة ⚠️</span>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{totalDebtsAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
                <span className="text-gray-500 text-sm">إجمالي المصاريف 📉</span>
                <h3 className="text-2xl font-black text-red-600 mt-1">{totalExpensesAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
                <span className="text-gray-500 text-sm">المركبات المغسولة 🚗</span>
                <h3 className="text-2xl font-black text-purple-600 mt-1">{totalVehiclesAll}</h3>
              </div>
            </div>

            {!isAllShops && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="text-amber-600" size={18} /> إدارة وتنبيهات عامل {currentShop?.name}
                </h3>
                
                <form onSubmit={handleAddAnnouncement} className="space-y-3 bg-gray-50 p-4 rounded-xl border">
                  <span className="text-xs font-bold text-gray-700 block">إرسال تنبيه جديد للعامل:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="عنوان التنبيه..." 
                      value={ownerNoticeTitle} 
                      onChange={e => setOwnerNoticeTitle(e.target.value)} 
                      className="px-3 py-2 border rounded-xl text-sm text-gray-900 bg-white" 
                      required
                    />
                    <input 
                      type="date" 
                      value={announcementDate} 
                      onChange={e => setAnnouncementDate(e.target.value)} 
                      className="px-3 py-2 border rounded-xl text-sm text-gray-900 bg-white" 
                      required
                    />
                  </div>
                  <textarea 
                    placeholder="نص التنبيه والملاحظة الموجهة للعامل..." 
                    value={ownerNoticeText} 
                    onChange={e => setOwnerNoticeText(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900 bg-white" 
                    required
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm">
                      نشر التنبيه 📢
                    </button>
                  </div>
                </form>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs text-gray-700">التنبيهات الفعالة المرسلة لهذا الفرع (يمكنك حذفها):</h4>
                  {shopAnnouncementsList.length === 0 ? (
                    <p className="text-xs text-gray-400">لا توجد تنبيهات مرسلة لهذا الفرع حالياً.</p>
                  ) : (
                    <div className="space-y-2">
                      {shopAnnouncementsList.map(ann => (
                        <div key={ann.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold text-gray-900">{ann.title}</span>
                            <p className="text-xs text-gray-700 mt-0.5">{ann.text}</p>
                            <span className="text-[10px] text-gray-400 block mt-1">تاريخ النشر: {ann.date}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteAnnouncement(selectedShopId, ann.id)}
                            className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-red-200 shadow-xs"
                          >
                            <Trash2 size={13} /> حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAllShops && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">📑 كشف الديون المجمع لجميع فروعك</h3>
                  <button 
                    onClick={handleRefreshData} 
                    disabled={isRefreshing}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                  >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                    {isRefreshing ? 'جاري التحديث...' : 'تحديث القوائم'}
                  </button>
                </div>
                {allShopsDebtsList.length === 0 ? (
                  <p className="text-xs text-gray-400">لا توجد ديون مسجلة في أي من فروعك حالياً.</p>
                ) : (
                  <div className="space-y-2">
                    {allShopsDebtsList.map(d => (
                      <div key={d.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-bold text-gray-900">🏪 {d.shopName} | 👤 الزبون: {d.debtorName}</span>
                          <p className="text-xs text-gray-600">📞 الهاتف: {d.phone} | الخدمة: {d.service} (التاريخ: {d.date})</p>
                        </div>
                        <span className="font-black text-red-600 text-base">{d.amount} ليرة</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isAllShops && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="text-red-600" size={18} /> تسجيل مصروف لـ {currentShop?.name}</h3>
                  <form onSubmit={handleAddExpense} className="space-y-3">
                    <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                      <option>غذاء وضيافة</option><option>مواد تنظيف وصيانة</option><option>فواتير خدمات</option><option>مصاريف أخرى</option>
                    </select>
                    <input type="text" placeholder="عنوان المصروف" value={expTitle} onChange={e => setExpTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <input type="number" placeholder="المبلغ" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <textarea placeholder="ملاحظات..." value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900" />
                    <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold cursor-pointer">خصم وتسجيل المصروف 📉</button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-gray-900">حركة المركبات لـ {currentShop?.name} (صلاحية الحذف للإدارة فقط)</h3>
                    <button 
                      onClick={handleRefreshData} 
                      disabled={isRefreshing}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                    >
                      <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                      {isRefreshing ? 'جاري التحديث...' : 'تحديث القائمة'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentShopTx.length === 0 ? <p className="text-xs text-gray-400">لا توجد سيارات مسجلة لهذا الفرع اليوم.</p> : currentShopTx.map(t => (
                      <div key={t.id} className="p-3 bg-gray-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border">
                        <div>
                          <span className="font-bold block text-gray-900">🏪 {currentShop.name}</span>
                          <span className="font-bold text-blue-600">[{t.vehicleCategory}] {t.carModel} | لوحة: {t.plate}</span> - {t.service}
                          <span className="block text-xs text-gray-500">المبلغ المسجل: {t.price} ليرة | الحالة: {t.method === 'دين' ? 'دين ⚠️' : t.method} {t.notes && `| ملاحظة: ${t.notes}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDeleteTransactionByOwner(selectedShopId, t.id)} className="bg-red-100 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Trash2 size={13} /> حذف الإدارة</button>
                          <button onClick={() => setSelectedInvoice({ ...t, shopName: currentShop.name, shopInfo: currentShop })} className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-black"><Printer size={14} /> طباعة الفاتورة</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'addShop' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl"><Building size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">إضافة فرع جديد لمجموعتك</h3>
                  <p className="text-xs text-gray-500">سيحصل الفرع الجديد على فترة تجريبية مجانية 7 أيام تلقائياً</p>
                </div>
              </div>

              <form onSubmit={handleOwnerAddShop} className="space-y-4">
                <input type="text" placeholder="اسم الفرع الجديد (مثال: مغسلة النسر - الفرع الجديد) *" value={newShopName} onChange={e => setNewShopName(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="email" placeholder="إيميل العامل لهذا الفرع (Gmail) *" value={newWorkerEmail} onChange={e => setNewWorkerEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" required />
                  <input type="password" placeholder="كلمة سر العامل *" value={newWorkerPass} onChange={e => setNewWorkerPass(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="رقم هاتف الفرع" value={newShopPhone} onChange={e => setNewShopPhone(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" />
                  <input type="text" placeholder="عنوان الفرع (المنطقة والشارع)" value={newShopAddress} onChange={e => setNewShopAddress(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900" />
                </div>
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm cursor-pointer shadow-md">إضافة الفرع الجديد لفروعي 🚀</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
              <h3 className="font-bold text-gray-900">فروعي المسجلة حالياً ({ownedShops.length}):</h3>
              <div className="space-y-3">
                {ownedShops.map(s => (
                  <div key={s.id} className="p-4 rounded-2xl border bg-gray-50 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-base text-gray-900">{s.name}</span>
                      <p className="text-xs text-gray-600">📍 العنوان: {s.address} | الهاتف: {s.phone}</p>
                      <p className="text-xs text-gray-500">👷‍♂️ إيميل العامل: {s.workerEmail}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl">نشط</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounting' && !isAllShops && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-4xl mx-auto space-y-6" id="accountStatement">
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="text-2xl font-black text-gray-900">🏪 {currentShop?.name}</h2>
              <p className="text-xs text-gray-600">كشف الحسابات المالي والتقارير والديون | {currentShop?.address} | هاتف: {currentShop?.phone}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <span className="text-xs text-blue-900 block font-bold">إجمالي الخدمات</span>
                <span className="text-lg font-black text-blue-700">{shopTotalServices} ليرة</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-900 block font-bold">المقبوض النقدي والبنكي</span>
                <span className="text-lg font-black text-emerald-700">{shopTotalPaid} ليرة</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-900 block font-bold">الديون المعلقة</span>
                <span className="text-lg font-black text-amber-700">{shopTotalDebtAmount} ليرة</span>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                <span className="text-xs text-red-900 block font-bold">إجمالي المصاريف</span>
                <span className="text-lg font-black text-red-700">{shopTotalExpenses} ليرة</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 md:col-span-1 col-span-2">
                <span className="text-xs text-purple-900 block font-bold">صافي الأرباح</span>
                <span className="text-lg font-black text-purple-700">{shopNetProfit} ليرة</span>
              </div>
            </div>

            <div className="space-y-3 bg-amber-50 p-5 rounded-2xl border border-amber-200">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-amber-900 text-base flex items-center gap-2">⚠️ سجل الديون على الزبائن:</h4>
                <button 
                  onClick={handleRefreshData} 
                  disabled={isRefreshing}
                  className="bg-white hover:bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-amber-300"
                >
                  <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} /> تحديث القائمة
                </button>
              </div>

              {currentShopDebts.length === 0 ? (
                <p className="text-xs text-gray-600">لا توجد ديون مسجلة على زبائن هذا الفرع.</p>
              ) : (
                <div className="space-y-2">
                  {currentShopDebts.map(d => (
                    <div key={d.id} className="p-3 bg-white rounded-xl shadow-xs flex justify-between items-center text-sm border border-amber-100">
                      <div>
                        <span className="font-bold text-gray-900">👤 الزبون: {d.debtorName}</span>
                        <p className="text-xs text-gray-700">📞 الهاتف: {d.phone} | الخدمة: {d.service}</p>
                        <span className="text-[10px] text-gray-500">التاريخ: {d.date} (بواسطة: {d.addedBy})</span>
                      </div>
                      <span className="text-base font-black text-red-600">{d.amount} ليرة</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 border-b pb-2">تفاصيل المصاريف المسجلة:</h4>
              {currentShopExpenses.length === 0 ? <p className="text-xs text-gray-500">لا توجد مصاريف مسجلة لهذا الفرع.</p> : currentShopExpenses.map(e => (
                <div key={e.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-900 font-medium">{e.title} ({e.category})</span>
                  <span className="text-red-600 font-bold">-{e.amount} ليرة</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => handlePrintInvoice({ shopName: currentShop.name, shopInfo: currentShop, plate: 'كشف حساب مالي شامل', type: 'جميع العمليات', service: 'تقرير الحسابات والديون والأرباح', startTime: '-', endTime: '-', method: 'تقرير', price: shopNetProfit })} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 hover:bg-black"><Printer size={16} /> طباعة كشف الحساب المالي (PDF)</button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-gray-900">الملف الشخصي والبيانات الضريبية ⚙️</h3>
            <form onSubmit={e => { e.preventDefault(); alert('تم تحديث البيانات بنجاح!'); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم صاحب المحل / المؤسسة</label>
                <input type="text" defaultValue={currentUser.ownerName} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني (Gmail)</label>
                <input type="email" defaultValue={currentUser.email} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الرقم الضريبي / المعرف الضريبي</label>
                <input type="text" defaultValue={currentUser.taxNumber} onChange={e => currentUser.taxNumber = e.target.value} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900 font-semibold" placeholder="أدخل الرقم الضريبي للمؤسسة" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm cursor-pointer">حفظ التعديلات الضريبية والشخصية</button>
            </form>
          </div>
        )}
      </main>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full space-y-6 relative" dir="rtl">
            <div className="space-y-4 text-right">
              <div className="text-center border-b pb-3">
                <h2 className="text-xl font-black text-gray-900">🏪 {selectedInvoice.shopName}</h2>
                <p className="text-xs text-gray-600">{selectedInvoice.shopInfo?.address || 'إسكندرون'} | هاتف: {selectedInvoice.shopInfo?.phone || '+90...'}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">فاتورة غسيل مركبات رسمية</span>
              </div>
              <div className="space-y-2 text-sm text-gray-800 font-medium">
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">نوع المركبة:</span><span className="font-bold text-gray-900">{selectedInvoice.vehicleCategory} ({selectedInvoice.vehicleCategory === 'سيارة' ? selectedInvoice.carModel : 'موتور'})</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">رقم اللوحة:</span><span className="font-bold text-gray-900">{selectedInvoice.plate}</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">الخدمة:</span><span className="font-bold text-gray-900">{selectedInvoice.service}</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">طريقة الدفع:</span><span className="font-bold text-gray-900">{selectedInvoice.method === 'دين' ? 'دين (على الذمة)' : selectedInvoice.method}</span>,</div>
                
                {selectedInvoice.notes && (
                  <div className="flex justify-between border-b pb-1"><span className="text-gray-600">ملاحظات العامل:</span><span className="font-bold text-amber-700">{selectedInvoice.notes}</span></div>
                )}

                {(selectedInvoice.beforePhoto || selectedInvoice.afterPhoto) && (
                  <div className="py-2 border-b">
                    <span className="text-xs text-gray-600 block mb-2 font-bold">توثيق الصور:</span>
                    <div className="flex justify-around gap-2">
                      {selectedInvoice.beforePhoto && (
                        <div className="text-center w-1/2">
                          <span className="text-[10px] text-gray-500 block">قبل الغسيل</span>
                          <img src={selectedInvoice.beforePhoto} alt="قبل" className="w-full h-20 object-cover rounded-lg border mt-1" />
                        </div>
                      )}
                      {selectedInvoice.afterPhoto && (
                        <div className="text-center w-1/2">
                          <span className="text-[10px] text-gray-500 block">بعد الغسيل</span>
                          <img src={selectedInvoice.afterPhoto} alt="بعد" className="w-full h-20 object-cover rounded-lg border mt-1" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-base font-black bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-emerald-900">المبلغ الإجمالي:</span><span className="text-emerald-700">{selectedInvoice.price} ليرة</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => handlePrintInvoice(selectedInvoice)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md">
                <Printer size={18} /> طباعة الفاتورة / PDF
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="px-5 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-bold cursor-pointer text-sm">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}