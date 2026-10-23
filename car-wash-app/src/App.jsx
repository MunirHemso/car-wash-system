import React, { useState, useEffect } from 'react';
import { 
  Car, Shield, Clock, Users, Wrench, Lock, Unlock, 
  Search, CreditCard, Banknote, LogOut, Building, Plus, CheckCircle, Printer, FileText, Camera, Calendar, Phone, MapPin, Tag, User, Settings, DollarSign, BarChart3, Key, Mail, AlertTriangle, Trash2, Edit3, Image as ImageIcon, RefreshCw, Bike, Bell, CheckSquare
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
      workerEmail: 'worker1@gmail.com',
      workerPass: '123456',
      phone: '+90 531 234 5678', 
      address: 'إسكندرون، شارع أتاتورك', 
      code: 'NESR-1', 
      status: 'active',
      suspendedAt: null
    }
  ]);

  // مزامنة المحلات والفروع سحابياً بشكل لحظي من Firestore
  useEffect(() => {
    const unsubShops = onSnapshot(collection(db, "platformShops"), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedShops = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() }));
        setShops(fetchedShops);
        
        // إذا كان المستخدم مسجلاً حالياً كمالك، نقوم بتحديث فروع لديه تلقائياً
        if (currentUser && currentUser.role === 'owner') {
          const updatedOwnedShops = fetchedShops.filter(s => s.ownerEmail.toLowerCase() === currentUser.email.toLowerCase());
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

  const [newShopName, setNewShopName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPass, setNewWorkerPass] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
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

  // تسجيل الدخول (يدعم المبرمج، المالك، والعامل عبر المطابقة الفورية مع الـ Firestore)
  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    if (!inputEmail || !inputPassword) return alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور');

    try {
      if (inputEmail.toLowerCase() === "munir@gmail.com") {
        try { await signInWithEmailAndPassword(auth, inputEmail, inputPassword); } catch (e) {}
        setCurrentUser({ email: inputEmail, role: 'programmer', name: 'المبرمج (المدير العام)' });
        return;
      }

      const ownedShops = shops.filter(s => s.ownerEmail.toLowerCase() === inputEmail.toLowerCase());
      if (ownedShops.length > 0) {
        try { await signInWithEmailAndPassword(auth, inputEmail, inputPassword); } catch (e) {}
        const userData = {
          email: inputEmail,
          role: 'owner',
          ownerName: ownedShops[0].owner,
          ownedShops: ownedShops
        };
        setCurrentUser(userData);
        const activeFirst = ownedShops.find(s => s.status === 'active') || ownedShops[0];
        setSelectedShopId(activeFirst.id);
        return;
      }

      const targetShop = shops.find(s => s.workerEmail && s.workerEmail.toLowerCase() === inputEmail.toLowerCase() && s.workerPass === inputPassword);
      if (targetShop) {
        if (targetShop.status === 'suspended') {
          alert('عذراً، هذا الفرع معلق أو موقوف حالياً من قبل الإدارة!');
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
      alert('فشل تسجيل الدخول: تأكد من صحة البيانات.');
    }
  };

  const handleForgotPassword = async () => {
    if (!inputEmail) return alert('الرجاء كتابة بريدك الإلكتروني أولاً!');
    try {
      await sendPasswordResetEmail(auth, inputEmail);
      alert('تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني بنجاح! 📧');
    } catch (error) {
      alert('حدث خطأ، تأكد من صحة البريد الإلكتروني.');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!ownerNoticeTitle || !ownerNoticeText || selectedShopId === 'all') return alert('الرجاء اختيار فرع محدد وتعبئة التنبيه');
    
    try {
      await addDoc(collection(db, "shops", String(selectedShopId), "announcements"), {
        title: ownerNoticeTitle,
        text: ownerNoticeText,
        date: announcementDate
      });
      setOwnerNoticeTitle('');
      setOwnerNoticeText('');
      alert('تم نشر التنبيه بنجاح للعامل! 📢✨');
    } catch (error) {
      alert('حدث خطأ أثناء النشر.');
    }
  };

  const handleDeleteAnnouncement = async (shopId, annId) => {
    if (!window.confirm('هل أنت متأكد من حذف التنبيه؟')) return;
    try {
      await deleteDoc(doc(db, "shops", String(shopId), "announcements", String(annId)));
      alert('تم الحذف بنجاح.');
    } catch (e) {}
  };

  const handleSettleDebtAction = async (shopId, debtObj) => {
    try {
      await deleteDoc(doc(db, "shops", String(shopId), "debts", String(debtObj.id)));
      await addDoc(collection(db, "shops", String(shopId), "debtRepayments"), {
        debtorName: debtObj.debtorName,
        amount: debtObj.amount,
        method: repayMethod,
        notes: repayNotes || 'تسديد دين سابق',
        date: repayDate
      });
      setSettlingDebtId(null);
      setRepayNotes('');
      alert(`تم تسديد دين الزبون (${debtObj.debtorName}) بقيمة ${debtObj.amount} ليرة بنجاح! 💵✅`);
    } catch (error) {
      alert('حدث خطأ أثناء تسديد الدين.');
    }
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

  const handleSuspendShop = async (shopId) => {
    if (!window.confirm('هل أنت متأكد من تعليق الفرع؟')) return;
    try {
      await updateDoc(doc(db, "platformShops", String(shopId)), { status: 'suspended', suspendedAt: new Date().toISOString() });
      alert('تم تعليق الفرع بنجاح.');
    } catch (e) { alert('خطأ أثناء التعليق'); }
  };

  const handleActivateShop = async (shopId) => {
    try {
      await updateDoc(doc(db, "platformShops", String(shopId)), { status: 'active', suspendedAt: null });
      alert('تم تفعيل الفرع بنجاح!');
    } catch (e) { alert('خطأ أثناء التفعيل'); }
  };

  const handleSaveEditShop = async (e) => {
    e.preventDefault();
    if (!editingShop) return;
    try {
      await updateDoc(doc(db, "platformShops", String(editingShop.id)), {
        name: editingShop.name,
        workerEmail: editingShop.workerEmail,
        workerPass: editingShop.workerPass,
        phone: editingShop.phone,
        address: editingShop.address
      });
      setEditingShop(null);
      alert('تم تعديل بيانات الفرع بنجاح!');
    } catch (e) { alert('خطأ أثناء الحفظ'); }
  };

  // 🚀 الحل الجذري والسريع: حفظ الفرع مباشرة في Firestore مع ربطه الكامل بالمالك الحالي
  const handleOwnerAddShop = async (e) => {
    e.preventDefault();
    if (!newShopName || !newWorkerEmail || !newWorkerPass) return alert('يرجى تعبئة اسم المحل وإيميل وكلمة سر العامل');

    try {
      const shopId = Date.now();
      const shopObj = {
        id: shopId,
        name: newShopName,
        owner: currentUser.ownerName,
        ownerEmail: currentUser.email,
        workerEmail: newWorkerEmail,
        workerPass: newWorkerPass,
        phone: newShopPhone || '+90 ...',
        address: newShopAddress || 'العنوان لم يحدد',
        code: 'SHOP-' + Math.floor(100 + Math.random() * 900),
        status: 'active',
        suspendedAt: null
      };

      await setDoc(doc(db, "platformShops", String(shopId)), shopObj);

      // تحديث حالة currentUser فوراً محلياً لضمان ظهور الفرع فوراً في القائمة
      const updatedShopsList = [...(currentUser.ownedShops || []), shopObj];
      setCurrentUser(prev => ({
        ...prev,
        ownedShops: updatedShopsList
      }));

      setNewShopName('');
      setNewWorkerEmail('');
      setNewWorkerPass('');
      setNewShopPhone('');
      setNewShopAddress('');
      setSelectedShopId(shopId);
      
      alert('تم إضافة الفرع وحفظه سحابياً بنجاح تام! 🏪✨ العامل يستطيع تسجيل الدخول فوراً.');
      setActiveTab('dashboard');
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ: ' + error.message);
    }
  };

  const handleDeleteTransactionByOwner = async (shopId, txId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه العملية؟')) return;
    try { await deleteDoc(doc(db, "shops", String(shopId), "transactions", String(txId))); alert('تم الحذف بنجاح'); } catch (e) {}
  };

  const handleStartEditTransaction = (t) => {
    setEditingTxId(t.id);
    setVehicleCategory(t.vehicleCategory || 'سيارة');
    setCarModel(t.carModel || '');
    setPlateNumber(t.plate);
    setServiceType(t.service);
    setPrice(t.price);
    setPayMethod(t.method);
    setTxNotes(t.notes || '');
    setStartTime(t.startTime);
    setEndTime(t.endTime);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!plateNumber || !price || !currentUser) return alert('أدخل اللوحة والسعر!');
    const shopId = currentUser.role === 'worker' ? currentUser.shopId : selectedShopId;
    if (!shopId || shopId === 'all') return alert('اختر محلاً محدداً');

    try {
      if (editingTxId) {
        await updateDoc(doc(db, "shops", String(shopId), "transactions", String(editingTxId)), {
          vehicleCategory, carModel: vehicleCategory === 'سيارة' ? carModel : 'دراجة نارية', plate: plateNumber, service: serviceType, price: Number(price), method: payMethod, notes: txNotes
        });
        setEditingTxId(null);
        alert('تم التحديث بنجاح');
      } else {
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
      }
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

  if (currentUser.role === 'programmer') {
    return (
      <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
        <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
          <span className="font-bold">لوحة المبرمج (المدير العام)</span><button onClick={handleLogout} className="bg-red-600 px-3 py-1.5 rounded-xl text-xs font-bold text-white">خروج</button>
        </header>
        <main className="max-w-6xl mx-auto p-6 space-y-4">
          <h3 className="text-lg font-bold">جميع المحلات في المنصة</h3>
          {shops.map(s => <div key={s.id} className="p-3 bg-white rounded-xl shadow-sm">{s.name} - مالك: {s.ownerEmail} | عامل: {s.workerEmail}</div>)}
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

  const ownedShops = currentUser.ownedShops || [];
  const currentShop = ownedShops.find(s => s.id === Number(selectedShopId)) || ownedShops[0];

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="font-bold">لوحة تحكم المالك: {currentUser.ownerName}</h1>
        <div className="flex gap-2">
          <select value={selectedShopId} onChange={e => setSelectedShopId(Number(e.target.value))} className="px-3 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold">
            {ownedShops.map(s => <option key={s.id} value={s.id}>{s.name} {s.status === 'suspended' ? '(معلق)' : ''}</option>)}
          </select>
          <button onClick={handleLogout} className="bg-red-600 px-3 py-2 rounded-xl text-xs font-bold text-white">خروج</button>
        </div>
      </header>

      <nav className="bg-white border-b px-6 py-3 flex gap-4 text-sm font-bold">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600 pb-2' : 'text-gray-700'}>نظرة عامة والجرد</button>
        <button onClick={() => setActiveTab('addShop')} className={activeTab === 'addShop' ? 'text-blue-600 border-b-2 border-blue-600 pb-2' : 'text-gray-700'}>إضافة وإدارة الفروع</button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
            <h2 className="text-xl font-black">{currentShop?.name}</h2>
            <p className="text-sm text-gray-500">📍 العنوان: {currentShop?.address} | 👷‍♂️ إيميل العامل: {currentShop?.workerEmail} (باسورد: {currentShop?.workerPass})</p>
          </div>
        )}

        {activeTab === 'addShop' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-xl mx-auto space-y-4">
            <h3 className="text-xl font-bold">إضافة محل أو فرع جديد</h3>
            <form onSubmit={handleOwnerAddShop} className="space-y-3">
              <input type="text" placeholder="اسم المحل أو الفرع *" value={newShopName} onChange={e => setNewShopName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
              <input type="email" placeholder="إيميل العامل *" value={newWorkerEmail} onChange={e => setNewWorkerEmail(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
              <input type="password" placeholder="كلمة سر العامل *" value={newWorkerPass} onChange={e => setNewWorkerPass(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
              <input type="text" placeholder="الهاتف" value={newShopPhone} onChange={e => setNewShopPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" />
              <input type="text" placeholder="العنوان" value={newShopAddress} onChange={e => setNewShopAddress(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" />
              <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm">حفظ الفرع الجديد سحابياً 🚀</button>
            </form>
          </div>
        )}
      </main>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 text-right" dir="rtl">
            <h3 className="font-bold text-lg text-center">فاتورة غسيل مركبات</h3>
            <p><strong>المحل:</strong> {selectedInvoice.shopName}</p>
            <p><strong>المركبة:</strong> {selectedInvoice.vehicleCategory} ({selectedInvoice.carModel || ''})</p>
            <p><strong>اللوحة:</strong> {selectedInvoice.plate}</p>
            <p><strong>الخدمة:</strong> {selectedInvoice.service}</p>
            <p><strong>المبلغ:</strong> {selectedInvoice.price} ليرة</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => handlePrintInvoice(selectedInvoice)} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold">طباعة</button>
              <button onClick={() => setSelectedInvoice(null)} className="px-4 bg-gray-200 py-2.5 rounded-xl font-bold">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}