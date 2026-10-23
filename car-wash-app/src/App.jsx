import React, { useState, useEffect } from 'react';
import { 
  Car, Shield, Users, Building, Plus, Printer, Camera, Phone, MapPin, Tag, 
  Settings, DollarSign, Mail, AlertTriangle, Trash2, Edit3, Image as ImageIcon, 
  RefreshCw, Bike, Bell, CheckSquare, Award, FileSpreadsheet, UserPlus, Wallet,
  LogOut, CheckCircle, UsersRound
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

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('carWash_currentUser');
  };

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
      subscriptionType: 'monthly',
      subscriptionExpiry: '2026-11-01',
      discountPercent: 0,
      suspendedAt: null
    }
  ]);

  const [pricingPlans, setPricingPlans] = useState([
    { id: 1, name: 'الباقة الشهرية', type: 'monthly', price: 500, currency: 'ليرة', maxShops: 2 },
    { id: 2, name: 'الباقة السنوية', type: 'yearly', price: 5000, currency: 'ليرة', maxShops: 5 },
    { id: 3, name: 'اشتراك مدى الحياة', type: 'lifetime', price: 15000, currency: 'ليرة', maxShops: 10 }
  ]);

  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanType, setNewPlanType] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanMaxShops, setNewPlanMaxShops] = useState('');

  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState('');
  const [editPlanMaxShops, setEditPlanMaxShops] = useState('');

  const [targetClientEmailForDiscount, setTargetClientEmailForDiscount] = useState('');
  const [directDiscountValue, setDirectDiscountValue] = useState('');

  const [selectedDateFilter, setSelectedDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [plateSearchQuery, setPlateSearchQuery] = useState('');

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 10000);
  };

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

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientTax, setNewClientTax] = useState('');
  const [newClientShopName, setNewClientShopName] = useState('');
  const [newClientWorkerEmail, setNewClientWorkerEmail] = useState('');
  const [newClientWorkerPass, setNewClientWorkerPass] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const [editingClientData, setEditingClientData] = useState(null);

  const [newShopName, setNewShopName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPass, setNewWorkerPass] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [ownerTaxNumber, setOwnerTaxNumber] = useState('');
  const [editingShopId, setEditingShopId] = useState(null);

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
      showToast('تم تحديث القوائم وجلب أحدث البيانات بنجاح! 🔄✨', 'success');
    }, 600);
  };

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    if (!inputEmail || !inputPassword) return showToast('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');

    try {
      if (inputEmail.toLowerCase() === "munir@gmail.com") {
        setCurrentUser({ email: inputEmail, role: 'programmer', name: 'المبرمج (المدير العام)' });
        return;
      }

      const ownedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === inputEmail.toLowerCase());
      if (ownedShops.length > 0) {
        const activeOrValidShops = ownedShops.filter(s => s.status !== 'suspended');
        if (activeOrValidShops.length === 0) {
          showToast('عذراً، حسابك موقوف أو انتهت صلاحية اشتراكه. يرجى مراجعة الإدارة!', 'error');
          return;
        }

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
          showToast('عذراً، هذا الفرع معلق أو انتهى اشتراكه من قبل الإدارة!', 'error');
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

      showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة!', 'error');
    } catch (error) {
      console.error(error);
      showToast('فشل تسجيل الدخول: تأكد من صحة البيانات المدخلة.', 'error');
    }
  };

  const handleForgotPassword = async () => {
    if (!inputEmail) {
      showToast('الرجاء كتابة بريدك الإلكتروني في حقل الإيميل أولاً!', 'error');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, inputEmail);
      showToast('تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني بنجاح. 📧', 'success');
    } catch (error) {
      console.error(error);
      showToast('حدث خطأ، تأكد من أن البريد الإلكتروني مسجل بشكل صحيح في النظام.', 'error');
    }
  };

  const handleProgrammerAddClient = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail || !newClientShopName || !newClientWorkerEmail || !newClientWorkerPass) {
      showToast('يرجى تعبئة الحقول الأساسية للعميل وفرعه الأول!', 'error');
      return;
    }

    try {
      const shopId = Date.now();
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7);

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
        discountPercent: 0,
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

      showToast('تم إضافة العميل الجديد بنجاح، ومَنحه فترة تجريبية مجانية لمدة 7 أيام! 🌟⏳', 'success');
      setProgrammerTab('clients');
    } catch (error) {
      showToast('حدث خطأ أثناء إضافة العميل: ' + error.message, 'error');
    }
  };

  const handleApplyDirectDiscountToClient = async (e) => {
    e.preventDefault();
    if (!targetClientEmailForDiscount || directDiscountValue === '') {
      showToast('اختر العميل وأدخل نسبة الخصم', 'error');
      return;
    }

    try {
      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === targetClientEmailForDiscount.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          discountPercent: Number(directDiscountValue)
        });
      }
      showToast(`تم تطبيق خصم بنسبة (${directDiscountValue}%) على جميع فروع العميل بنجاح! 🏷️✨`, 'success');
      setDirectDiscountValue('');
      setTargetClientEmailForDiscount('');
    } catch (e) {
      showToast('حدث خطأ أثناء تطبيق الخصم.', 'error');
    }
  };

  const handleSaveClientEdits = async (e) => {
    e.preventDefault();
    if (!editingClientData) return;

    try {
      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === editingClientData.ownerEmail.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          owner: editingClientData.ownerName,
          taxNumber: editingClientData.taxNumber,
          phone: editingClientData.phone
        });
      }
      setEditingClientData(null);
      showToast('تم تحديث بيانات العميل والبيانات الضريبية بنجاح! ✅', 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء التحديث.', 'error');
    }
  };

  const handleSuspendClientForMonths = async (clientEmail) => {
    if (!window.confirm('هل أنت متأكد من تعليق حساب هذا العميل وجميع فروعه (أرشفة لمدة 3 أشهر)؟')) return;

    try {
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          status: 'suspended',
          suspendedAt: new Date().toISOString(),
          gracePeriodExpiry: threeMonthsLater.toISOString().slice(0, 10)
        });
      }
      setSelectedClientEmail(null);
      showToast('تم تعليق الحساب وأرشفته بنجاح لمدة 3 أشهر.', 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء تعليق الحساب.', 'error');
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
    } else {
      now.setDate(now.getDate() + 30);
      expiryDate = now.toISOString().slice(0, 10);
    }

    try {
      const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
      for (const shop of clientShops) {
        await updateDoc(doc(db, "platformShops", String(shop.id)), {
          subscriptionType: planType,
          subscriptionExpiry: expiryDate,
          status: 'active',
          suspendedAt: null,
          gracePeriodExpiry: null
        });
      }
      showToast(`تم تجديد اشتراك العميل (${clientEmail}) بنجاح لجميع فروعه (${clientShops.length} فروع)! 🌟✨`, 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء تجديد الاشتراك.', 'error');
    }
  };

  const handleSuspendShop = async (shopId) => {
    if (!window.confirm('هل أنت متأكد من تعليق هذا الفرع وإيقاف اشتراكه؟')) return;
    try {
      await updateDoc(doc(db, "platformShops", String(shopId)), {
        status: 'suspended',
        suspendedAt: new Date().toISOString()
      });
      showToast('تم تعليق المحل وإيقاف اشتراكه بنجاح.', 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء تعليق الفرع.', 'error');
    }
  };

  const handleActivateShop = async (shopId) => {
    try {
      await updateDoc(doc(db, "platformShops", String(shopId)), {
        status: 'active',
        suspendedAt: null,
        gracePeriodExpiry: null
      });
      showToast('تم تفعيل الفرع بنجاح!', 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء تفعيل الفرع.', 'error');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!ownerNoticeTitle || !ownerNoticeText || selectedShopId === 'all') return showToast('الرجاء اختيار فرع محدد وتعبئة العنوان ونَص الملاحظة', 'error');
    
    try {
      await addDoc(collection(db, "shops", String(selectedShopId), "announcements"), {
        title: ownerNoticeTitle,
        text: ownerNoticeText,
        date: announcementDate
      });
      setOwnerNoticeTitle('');
      setOwnerNoticeText('');
      showToast('تم نشر التنبيه بنجاح للعامل في الفرع! 📢✨', 'success');
    } catch (error) {
      showToast('حدث خطأ أثناء نشر التنبيه.', 'error');
    }
  };

  const handleDeleteAnnouncement = async (shopId, annId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التنبيه؟')) return;
    try {
      await deleteDoc(doc(db, "shops", String(shopId), "announcements", String(annId)));
      showToast('تم حذف التنبيه بنجاح.', 'success');
    } catch (error) {}
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
      showToast(`تم تسديد دين الزبون (${debtObj.debtorName}) بقيمة ${debtObj.amount} ليرة بنجاح وإضافته للصندوق! 💵✅`, 'success');
    } catch (error) {
      showToast('حدث خطأ أثناء تسديد الدين.', 'error');
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
          showToast('خطأ في معالجة الصورة.', 'error');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePrintInvoice = (inv) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return showToast('يرجى السماح بفتح النوافذ المنبثقة.', 'error');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - ${inv.plate}</title>
        <style>
          body { font-family: Tahoma, sans-serif; padding: 20px; text-align: right; }
          .box { max-width: 450px; margin: auto; border: 2px solid #0f172a; padding: 20px; border-radius: 15px; }
          .center { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 10px; margin-bottom: 15px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .photos { display: flex; justify-content: space-around; margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 10px; text-align: center; }
          .photos img { width: 45%; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; }
          .total { background: #ecfdf5; color: #047857; padding: 10px; text-align: center; font-weight: bold; margin-top: 15px; border-radius: 8px; border: 1px solid #a7f3d0; }
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
          <div class="row"><span>وقت العمل:</span><strong>${inv.startTime || '-'} ➔ ${inv.endTime || '-'}</strong></div>
          <div class="row"><span>الدفع:</span><strong>${inv.method}</strong></div>
          ${inv.notes ? `<div class="row"><span>ملاحظات:</span><strong>${inv.notes}</strong></div>` : ''}

          ${(inv.beforePhoto || inv.afterPhoto) ? `
            <div class="photos">
              ${inv.beforePhoto ? `<div><span style="font-size:10px;">قبل الغسيل</span><img src="${inv.beforePhoto}"/></div>` : ''}
              ${inv.afterPhoto ? `<div><span style="font-size:10px;">بعد الغسيل</span><img src="${inv.afterPhoto}"/></div>` : ''}
            </div>
          ` : ''}

          <div class="total">الإجمالي: ${inv.price} ليرة</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleOwnerSaveShop = async (e) => {
    e.preventDefault();
    if (!newShopName || !newWorkerEmail || !newWorkerPass) return showToast('يرجى تعبئة اسم الفرع وإيميل وكلمة سر العامل', 'error');

    const ownedShops = currentUser.ownedShops || [];
    
    if (!editingShopId) {
      const firstShop = ownedShops[0];
      const subType = firstShop ? (firstShop.subscriptionType || 'trial') : 'trial';
      
      let maxAllowedShops = 1; 
      if (subType === 'trial') {
        maxAllowedShops = 1; 
      } else {
        const matchedPlan = pricingPlans.find(p => p.type === subType);
        maxAllowedShops = matchedPlan ? matchedPlan.maxShops : 2;
      }

      if (ownedShops.length >= maxAllowedShops) {
        showToast(`عذراً، باقتك الحالية (${subType}) تسمح بإنشاء ${maxAllowedShops} فروع كحد أقصى. يرجى ترقية الباقة لدى الإدارة لزيادة عدد الفروع!`, 'error');
        return;
      }
    }

    try {
      const shopId = editingShopId ? editingShopId : Date.now();
      const firstShop = ownedShops[0] || {};
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 7);

      const existingShop = shops.find(s => s.id === Number(shopId)) || {};

      const baseSubscriptionType = firstShop.subscriptionType || existingShop.subscriptionType || 'trial';
      const baseSubscriptionExpiry = firstShop.subscriptionExpiry || existingShop.subscriptionExpiry || trialExpiry.toISOString().slice(0, 10);

      const shopObj = {
        id: Number(shopId),
        name: newShopName,
        owner: currentUser.ownerName,
        ownerEmail: currentUser.email,
        taxNumber: currentUser.taxNumber || ownerTaxNumber || 'غير مسجل',
        workerEmail: newWorkerEmail,
        workerPass: newWorkerPass,
        phone: newShopPhone || '+90 ...',
        address: newShopAddress || 'العنوان لم يحدد',
        code: existingShop.code || ('SHOP-' + Math.floor(100 + Math.random() * 900)),
        status: existingShop.status || 'active',
        subscriptionType: baseSubscriptionType,
        subscriptionExpiry: baseSubscriptionExpiry,
        discountPercent: existingShop.discountPercent || 0,
        suspendedAt: existingShop.suspendedAt || null
      };

      await setDoc(doc(db, "platformShops", String(shopId)), shopObj);

      const updatedOwnedShops = editingShopId 
        ? ownedShops.map(s => s.id === Number(shopId) ? shopObj : s)
        : [...ownedShops, shopObj];

      setCurrentUser(prev => ({
        ...prev,
        ownedShops: updatedOwnedShops
      }));

      setNewShopName('');
      setNewWorkerEmail('');
      setNewWorkerPass('');
      setNewShopPhone('');
      setNewShopAddress('');
      setEditingShopId(null);
      setSelectedShopId(shopId);
      
      showToast(editingShopId ? 'تم تحديث بيانات الفرع بنجاح! ✏️✨' : 'تم إضافة الفرع الجديد بنجاح وارتباط صلاحيته بالحساب الأساسي! 🏪✨', 'success');
    } catch (error) {
      showToast('حدث خطأ أثناء الحفظ: ' + error.message, 'error');
    }
  };

  const handleStartEditShop = (shop) => {
    setEditingShopId(shop.id);
    setNewShopName(shop.name);
    setNewWorkerEmail(shop.workerEmail || '');
    setNewWorkerPass(shop.workerPass || '');
    setNewShopPhone(shop.phone || '');
    setNewShopAddress(shop.address || '');
  };

  const handleDeleteShopByOwner = async (shopId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفرع نهائياً من مجموعتك؟')) return;
    try {
      await deleteDoc(doc(db, "platformShops", String(shopId)));
      const updatedOwnedShops = (currentUser.ownedShops || []).filter(s => s.id !== Number(shopId));
      setCurrentUser(prev => ({
        ...prev,
        ownedShops: updatedOwnedShops
      }));
      if (selectedShopId === Number(shopId)) {
        setSelectedShopId(updatedOwnedShops[0]?.id || 'all');
      }
      showToast('تم حذف الفرع بنجاح 🗑️', 'success');
    } catch (e) {
      showToast('حدث خطأ أثناء حذف الفرع', 'error');
    }
  };

  const handleDeleteTransactionByOwner = async (shopId, txId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه العملية؟')) return;
    try { await deleteDoc(doc(db, "shops", String(shopId), "transactions", String(txId))); showToast('تم الحذف بنجاح', 'success'); } catch (e) {}
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
    if (t.beforePhoto) setBeforePhoto(t.beforePhoto);
    if (t.afterPhoto) setAfterPhoto(t.afterPhoto);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!plateNumber || !price || !currentUser) return showToast('أدخل اللوحة والسعر!', 'error');
    const shopId = currentUser.role === 'worker' ? currentUser.shopId : selectedShopId;
    if (!shopId || shopId === 'all') return showToast('اختر محلاً محدداً', 'error');

    try {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      if (editingTxId) {
        await updateDoc(doc(db, "shops", String(shopId), "transactions", String(editingTxId)), {
          vehicleCategory, carModel: vehicleCategory === 'سيارة' ? carModel : 'دراجة نارية', plate: plateNumber, service: serviceType, price: Number(price), paid: payMethod === 'دين' ? 0 : Number(price), method: payMethod, notes: txNotes, startTime, endTime, beforePhoto, afterPhoto
        });
        setEditingTxId(null);
        showToast('تم التحديث بنجاح ✏️', 'success');
      } else {
        await addDoc(collection(db, "shops", String(shopId), "transactions"), {
          vehicleCategory, carModel: vehicleCategory === 'سيارة' ? carModel : 'دراجة نارية', plate: plateNumber, service: serviceType, price: Number(price), paid: payMethod === 'دين' ? 0 : Number(price), method: payMethod, notes: txNotes, startTime, endTime, date: todayDateStr, beforePhoto, afterPhoto
        });
        if (payMethod === 'دين') {
          await addDoc(collection(db, "shops", String(shopId), "debts"), {
            debtorName, phone: debtorPhone, service: serviceType, amount: Number(price), date: todayDateStr, addedBy: 'عامل الفرع'
          });
          setDebtorName(''); setDebtorPhone('');
        }
        showToast('تم تسجيل الطلب بنجاح! 🚗✨', 'success');
      }
      setPlateNumber(''); setCarModel(''); setPrice(''); setTxNotes(''); setBeforePhoto(null); setAfterPhoto(null);
    } catch (e) { showToast('خطأ: ' + e.message, 'error'); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const shopId = currentUser.role === 'worker' ? currentUser.shopId : selectedShopId;
    if (!expTitle || !expAmount || !shopId || shopId === 'all') return showToast('أدخل بيانات المصروف وافرز المحل بدقة', 'error');
    
    try {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      await addDoc(collection(db, "shops", String(shopId), "expenses"), {
        category: expCategory, 
        title: expTitle, 
        amount: Number(expAmount), 
        notes: expNotes, 
        date: todayDateStr,
        time: new Date().toLocaleTimeString()
      });
      setExpTitle(''); setExpAmount(''); setExpNotes('');
      showToast('تم تسجيل المصروف بنجاح وخصمه من كشف الحساب والأرباح! 📉✅', 'success');
    } catch (e) { showToast('حدث خطأ أثناء حفظ المصروف', 'error'); }
  };

  const handleAddPricingPlan = (e) => {
    e.preventDefault();
    if (!newPlanName || !newPlanPrice || !newPlanMaxShops) {
      showToast('يرجى تعبئة جميع حقول الباقة الجديدة!', 'error');
      return;
    }
    const planTypeKey = newPlanType ? newPlanType.toLowerCase().replace(/\s+/g, '_') : ('plan_' + Date.now());
    const newPlanObj = {
      id: Date.now(),
      name: newPlanName,
      type: planTypeKey,
      price: Number(newPlanPrice),
      currency: 'ليرة',
      maxShops: Number(newPlanMaxShops)
    };
    setPricingPlans([...pricingPlans, newPlanObj]);
    setNewPlanName('');
    setNewPlanType('');
    setNewPlanPrice('');
    setNewPlanMaxShops('');
    showToast('تم إضافة الباقة الجديدة بنجاح! 🌟', 'success');
  };

  const handleDeletePricingPlan = (planId) => {
    if (pricingPlans.length <= 1) {
      showToast('يجب أن تبقى باقة واحدة على الأقل في النظام!', 'error');
      return;
    }
    if (!window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    setPricingPlans(pricingPlans.filter(p => p.id !== planId));
    showToast('تم حذف الباقة بنجاح.', 'success');
  };

  const handleStartEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price);
    setEditPlanMaxShops(plan.maxShops);
  };

  const handleSaveEditPlan = (planId) => {
    setPricingPlans(pricingPlans.map(p => p.id === planId ? {
      ...p,
      name: editPlanName,
      price: Number(editPlanPrice),
      maxShops: Number(editPlanMaxShops)
    } : p));
    setEditingPlanId(null);
    showToast('تم تحديث بيانات الباقة بنجاح! ✅', 'success');
  };

  const calculateTimeRemaining = (expiryDateStr) => {
    if (!expiryDateStr || expiryDateStr.includes('مدى الحياة')) return 'مدى الحياة ♾️';
    const diff = new Date(expiryDateStr) - new Date();
    if (diff <= 0) return 'منتهي الصلاحية ⚠️';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} يوم و ${hours} ساعة متبقية`;
  };

  const renderToastComponent = () => {
    if (!toast) return null;
    return (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 min-w-[320px] max-w-lg">
        <div className={`p-2 rounded-xl ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
        </div>
        <div className="flex-1 text-sm font-semibold">{toast.message}</div>
        <button 
          onClick={() => setToast(null)} 
          className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer text-sm font-bold"
        >
          ✕
        </button>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
        {renderToastComponent()}
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

  // ================= 🌟 واجهة المبرمج الاحترافية (SaaS Admin) =================
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
          discountPercent: s.discountPercent || 0,
          shopsList: []
        };
      }
      clientsMap[email].shopsList.push(s);
    });

    const clientsList = Object.values(clientsMap);
    const activeClientsList = clientsList.filter(client => client.shopsList.some(s => s.status === 'active'));
    const suspendedClientsList = clientsList.filter(client => client.shopsList.every(s => s.status === 'suspended'));
    const activeShopsCount = shops.filter(s => s.status === 'active').length;
    const selectedClient = clientsList.find(c => c.ownerEmail === selectedClientEmail);

    let totalSubscriptionRevenue = 0;
    activeClientsList.forEach(client => {
      const firstShop = client.shopsList[0] || {};
      const basePrice = firstShop.subscriptionType === 'yearly' ? 5000 : firstShop.subscriptionType === 'lifetime' ? 15000 : firstShop.subscriptionType === 'trial' ? 0 : 500;
      const discount = client.discountPercent || 0;
      const discountedPrice = basePrice * (1 - discount / 100);
      totalSubscriptionRevenue += discountedPrice * client.shopsList.filter(s => s.status === 'active').length;
    });

    const clientsWithDiscounts = clientsList.filter(c => c.discountPercent > 0);
    const vipClients = activeClientsList.filter(c => c.shopsList.length >= 3);
    const regularClients = activeClientsList.filter(c => c.shopsList.length < 3);

    return (
      <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
        {renderToastComponent()}

        {/* هيدر المبرمج بمعايير SaaS الحديثة */}
        <header className="bg-slate-950 border-b border-slate-800 text-white px-6 py-4 shadow-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Shield size={22} />
            </div>
            <div>
              <span className="font-extrabold text-white text-base">لوحة المدير العام والتحكم الشامل</span>
              <p className="text-xs text-slate-400">إدارة المنصة، العملاء، وباقات الأسعار</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition">
            <LogOut size={15} /> تسجيل خروج
          </button>
        </header>

        {/* شريط التنقل للمبرمج */}
        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex gap-2 text-xs md:text-sm font-bold shadow-xs overflow-x-auto">
          <button onClick={() => { setProgrammerTab('clients'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'clients' && !selectedClientEmail ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            👥 العملاء النشطون
          </button>
          <button onClick={() => { setProgrammerTab('suspendedClients'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'suspendedClients' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            ⏳ الحسابات المعلقة ({suspendedClientsList.length})
          </button>
          <button onClick={() => { setProgrammerTab('addClient'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'addClient' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            ➕ إضافة عميل جديد
          </button>
          <button onClick={() => { setProgrammerTab('pricingPlans'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'pricingPlans' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            💰 الباقات والفروع
          </button>
          <button onClick={() => { setProgrammerTab('directDiscounts'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'directDiscounts' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            🏷️ الخصومات المباشرة
          </button>
          <button onClick={() => { setProgrammerTab('subscriptionsReport'); setSelectedClientEmail(null); }} className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${programmerTab === 'subscriptionsReport' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
            📑 كشف حسابات الاشتراكات
          </button>
        </nav>

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <span className="text-gray-500 text-sm">العملاء النشطون</span>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{activeClientsList.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
              <span className="text-gray-500 text-sm">إجمالي الفروع</span>
              <h3 className="text-3xl font-black text-blue-600 mt-1">{shops.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
              <span className="text-gray-500 text-sm">الفروع النشطة</span>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{activeShopsCount}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
              <span className="text-gray-500 text-sm">إجمالي الإيرادات (بعد الخصم)</span>
              <h3 className="text-3xl font-black text-purple-600 mt-1">{totalSubscriptionRevenue} ليرة</h3>
            </div>
          </div>

          {programmerTab === 'clients' && !selectedClient && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">
                  <Award className="text-purple-600" size={22} /> كبار العملاء / VIP النشطون (3 فروع أو أكثر)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vipClients.length === 0 ? <p className="text-xs text-gray-400">لا توجد عملاء VIP نشطون حالياً.</p> : vipClients.map((client, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border-2 border-purple-200 bg-purple-50/20 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-lg text-slate-900">⭐ {client.ownerName}</h4>
                          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs">
                            🏢 {client.shopsList.length} فروع
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">📞 الهاتف: {client.phone}</p>
                        {client.discountPercent > 0 && <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">خصم مفعل: {client.discountPercent}%</span>}
                      </div>
                      <button onClick={() => setSelectedClientEmail(client.ownerEmail)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                        عرض الملف الكامل وفروعه 🔍
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Users className="text-blue-600" size={22} /> العملاء العاديون النشطون (1 إلى 2 فرع)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {regularClients.length === 0 ? <p className="text-xs text-gray-400">لا توجد عملاء.</p> : regularClients.map((client, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border bg-gray-50 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-lg text-slate-900">👤 {client.ownerName}</h4>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-xl shadow-xs">
                            🏢 {client.shopsList.length} فرع
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">📞 الهاتف: {client.phone}</p>
                        {client.discountPercent > 0 && <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">خصم مفعل: {client.discountPercent}%</span>}
                      </div>
                      <button onClick={() => setSelectedClientEmail(client.ownerEmail)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                        عرض الملف الكامل وفروعه 🔍
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {programmerTab === 'suspendedClients' && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
              <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                ⏳ الحسابات المعلقة والمؤرشفة (بانتظار إعادة التفعيل أو انتهاء مهلة 3 أشهر)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suspendedClientsList.length === 0 ? (
                  <p className="text-xs text-gray-400">لا توجد حسابات معلقة حالياً.</p>
                ) : (
                  suspendedClientsList.map((client, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/20 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-lg text-slate-900">👤 {client.ownerName}</h4>
                          <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs">
                            معلق / مؤرشف
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">📞 الهاتف: {client.phone}</p>
                        <p className="text-xs text-red-600 font-semibold mt-1">عدد الفروع المعلقة: {client.shopsList.length}</p>
                      </div>
                      <button onClick={() => setSelectedClientEmail(client.ownerEmail)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                        إدارة الحساب وتفعيله 🔍
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {programmerTab === 'addClient' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl"><UserPlus size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">إضافة عميل جديد للنظام</h3>
                  <p className="text-xs text-gray-500">سيحصل العميل تلقائياً على فترة تجريبية مجانية لمدة 7 أيام</p>
                </div>
              </div>

              <form onSubmit={handleProgrammerAddClient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم العميل الكامل *</label>
                    <input type="text" placeholder="مثال: خالد أحمد" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني (Gmail) *</label>
                    <input type="email" placeholder="khaled@gmail.com" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف</label>
                    <input type="text" placeholder="+90 500 000 0000" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الرقم الضريبي</label>
                    <input type="text" placeholder="الرقم الضريبي للمؤسسة" value={newClientTax} onChange={e => setNewClientTax(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-bold text-sm text-purple-700">تفاصيل الفرع الأول:</h4>
                  <input type="text" placeholder="اسم الفرع الأول *" value={newClientShopName} onChange={e => setNewClientShopName(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">إيميل العامل *</label>
                      <input type="email" placeholder="worker@gmail.com" value={newClientWorkerEmail} onChange={e => setNewClientWorkerEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">كلمة سر العامل *</label>
                      <input type="password" placeholder="••••••••" value={newClientWorkerPass} onChange={e => setNewClientWorkerPass(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" required />
                    </div>
                  </div>

                  <input type="text" placeholder="عنوان الفرع" value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 bg-white" />
                </div>

                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md">تسجيل العميل ومنحه 7 أيام تجريبية 🚀</button>
              </form>
            </div>
          )}

          {programmerTab === 'pricingPlans' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl"><Plus size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">إضافة باقة اشتراك جديدة</h3>
                    <p className="text-xs text-gray-500">أنشئ باقة جديدة وحدد سعرها والحد الأقصى للفروع المسموحة</p>
                  </div>
                </div>

                <form onSubmit={handleAddPricingPlan} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">اسم الباقة *</label>
                      <input 
                        type="text" 
                        placeholder="مثال: الباقة الذهبية" 
                        value={newPlanName} 
                        onChange={e => setNewPlanName(e.target.value)} 
                        className="w-full px-4 py-3 border rounded-xl text-sm bg-slate-50 focus:bg-white text-gray-900 font-semibold" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">معرف الباقة (الانجليزي -اختياري)</label>
                      <input 
                        type="text" 
                        placeholder="مثال: gold_plan" 
                        value={newPlanType} 
                        onChange={e => setNewPlanType(e.target.value)} 
                        className="w-full px-4 py-3 border rounded-xl text-sm bg-slate-50 focus:bg-white text-gray-900 font-semibold font-mono" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">السعر (ليرة) *</label>
                      <input 
                        type="number" 
                        placeholder="مثال: 7500" 
                        value={newPlanPrice} 
                        onChange={e => setNewPlanPrice(e.target.value)} 
                        className="w-full px-4 py-3 border rounded-xl text-sm bg-slate-50 focus:bg-white text-gray-900 font-bold" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">الحد الأقصى لعدد الفروع المسموحة *</label>
                      <input 
                        type="number" 
                        placeholder="مثال: 7" 
                        value={newPlanMaxShops} 
                        onChange={e => setNewPlanMaxShops(e.target.value)} 
                        className="w-full px-4 py-3 border rounded-xl text-sm bg-slate-50 focus:bg-white text-gray-900 font-bold" 
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md transition">
                    إضافة الباقة الجديدة للنظام 🌟
                  </button>
                </form>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="font-black text-lg text-gray-900">💰 الباقات الحالية المتاحة ({pricingPlans.length}):</h3>
                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">تحكم كامل</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {pricingPlans.map(plan => (
                    <div key={plan.id} className="p-5 border-2 rounded-2xl bg-slate-50 flex flex-col justify-between space-y-4 relative shadow-xs">
                      {editingPlanId === plan.id ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">اسم الباقة:</label>
                            <input 
                              type="text" 
                              value={editPlanName} 
                              onChange={e => setEditPlanName(e.target.value)} 
                              className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900 bg-white" 
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">السعر (ليرة):</label>
                            <input 
                              type="number" 
                              value={editPlanPrice} 
                              onChange={e => setEditPlanPrice(e.target.value)} 
                              className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900 bg-white" 
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">الحد الأقصى للفروع:</label>
                            <input 
                              type="number" 
                              value={editPlanMaxShops} 
                              onChange={e => setEditPlanMaxShops(e.target.value)} 
                              className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-gray-900 bg-white" 
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button onClick={() => handleSaveEditPlan(plan.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold">حفظ ✅</button>
                            <button onClick={() => setEditingPlanId(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl text-xs font-bold">إلغاء</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-lg text-slate-900">{plan.name}</h4>
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">{plan.type}</span>
                            </div>
                            <p className="text-2xl font-black text-purple-600 pt-1">{plan.price} {plan.currency}</p>
                            <div className="pt-2">
                              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200">
                                الحد الأقصى: {plan.maxShops} فروع مسموحة
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-3 border-t">
                            <button onClick={() => handleStartEditPlan(plan)} className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                              <Edit3 size={13} /> تعديل
                            </button>
                            <button onClick={() => handleDeletePricingPlan(plan.id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                              <Trash2 size={13} /> حذف
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {programmerTab === 'directDiscounts' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-4xl mx-auto space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-xl font-bold text-gray-900">🏷️ نظام الخصومات المباشرة على الاشتراكات</h3>
                <p className="text-xs text-gray-500">اختر العميل وحدد نسبة الخصم المباشر (مثلاً خصم 50%)</p>
              </div>

              <form onSubmit={handleApplyDirectDiscountToClient} className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-3">
                <h4 className="font-bold text-sm text-purple-900">تطبيق خصم مباشر على عميل محدد:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select 
                    value={targetClientEmailForDiscount} 
                    onChange={e => setTargetClientEmailForDiscount(e.target.value)} 
                    className="px-3 py-2.5 border rounded-xl text-sm bg-white text-gray-900 font-bold"
                    required
                  >
                    <option value="">-- اختر العميل (صاحب المحل) --</option>
                    {activeClientsList.map((c, i) => <option key={i} value={c.ownerEmail}>{c.ownerName}</option>)}
                  </select>
                  <input 
                    type="number" 
                    placeholder="نسبة الخصم % (مثال: 50)" 
                    value={directDiscountValue} 
                    onChange={e => setDirectDiscountValue(e.target.value)} 
                    className="px-3 py-2.5 border rounded-xl text-sm bg-white text-gray-900 font-bold" 
                    required 
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm">
                    تطبيق الخصم المباشر على العميل 🏷️✨
                  </button>
                </div>
              </form>

              <div className="space-y-3 pt-4">
                <h4 className="font-bold text-gray-900 text-base">قائمة العملاء الذين لديهم خصومات مفعلة ({clientsWithDiscounts.length}):</h4>
                {clientsWithDiscounts.length === 0 ? (
                  <p className="text-xs text-gray-500">لا توجد خصومات مفعلة لأي عميل حالياً.</p>
                ) : (
                  clientsWithDiscounts.map((client, idx) => (
                    <div key={idx} className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-slate-900">👤 {client.ownerName}</span>
                        <p className="text-xs text-emerald-700 font-bold mt-0.5">نسبة الخصم المفعلة: {client.discountPercent}% على جميع فروعه</p>
                      </div>
                      <button 
                        onClick={async () => {
                          const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === client.ownerEmail.toLowerCase());
                          for (const shop of clientShops) {
                            await updateDoc(doc(db, "platformShops", String(shop.id)), { discountPercent: 0 });
                          }
                          showToast('تم إزالة الخصم عن العميل بنجاح.', 'success');
                        }}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        إلغاء الخصم ❌
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedClient && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase">ملف العميل التجاري والضريبي</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">👤 {selectedClient.ownerName}</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => setEditingClientData({ ownerName: selectedClient.ownerName, ownerEmail: selectedClient.ownerEmail, taxNumber: selectedClient.taxNumber, phone: selectedClient.phone })}
                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    تعديل البيانات ✏️
                  </button>
                  <button 
                    onClick={() => handleSuspendClientForMonths(selectedClient.ownerEmail)}
                    className="bg-amber-100 text-amber-800 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    تعليق وحفظ الحساب لمدة 3 أشهر ⏳
                  </button>
                  <button 
                    onClick={() => setSelectedClientEmail(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    العودة 🔙
                  </button>
                </div>
              </div>

              {editingClientData && (
                <form onSubmit={handleSaveClientEdits} className="bg-blue-50 p-5 rounded-2xl border border-blue-200 space-y-3">
                  <h4 className="font-bold text-sm text-blue-900">تعديل بيانات العميل أو تحديث بيانات الدخول والضريبة:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" value={editingClientData.ownerName} onChange={e => setEditingClientData({...editingClientData, ownerName: e.target.value})} placeholder="اسم العميل" className="px-3 py-2 border rounded-xl text-xs bg-white text-gray-900" required />
                    <input type="text" value={editingClientData.phone} onChange={e => setEditingClientData({...editingClientData, phone: e.target.value})} placeholder="رقم الهاتف" className="px-3 py-2 border rounded-xl text-xs bg-white text-gray-900" />
                    <input type="text" value={editingClientData.taxNumber} onChange={e => setEditingClientData({...editingClientData, taxNumber: e.target.value})} placeholder="الرقم الضريبي" className="px-3 py-2 border rounded-xl text-xs bg-white text-gray-900" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">حفظ التعديلات ✅</button>
                    <button type="button" onClick={() => setEditingClientData(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
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
                  <h4 className="font-bold text-sm">تجديد اشتراكات جميع فروع هذا العميل دفعة واحدة (تُحتسب صلاحيتها على الحساب الأساسي):</h4>
                  <p className="text-xs text-gray-300">يملك هذا العميل {selectedClient.shopsList.length} فرعاً مسجلاً في المنصة.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {pricingPlans.map(plan => (
                    <button key={plan.id} onClick={() => handleUpdateClientSubscription(selectedClient.ownerEmail, plan.type)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
                      تجديد ({plan.name}) 📅
                    </button>
                  ))}
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
                          {shop.status === 'active' ? 'نشط' : 'معلق / مؤرشف'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">📍 العنوان: {shop.address} | الهاتف: {shop.phone}</p>
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

          {programmerTab === 'subscriptionsReport' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">إجمالي الإيرادات (بعد الخصومات)</span>
                    <h3 className="text-3xl font-black text-emerald-400 mt-1">{totalSubscriptionRevenue} ليرة</h3>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl"><Wallet size={28} className="text-purple-300" /></div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">إجمالي العملاء النشطين</span>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{activeClientsList.length} عميل</h3>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl"><UsersRound size={28} className="text-purple-600" /></div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">إجمالي الفروع النشطة</span>
                    <h3 className="text-3xl font-black text-blue-600 mt-1">{activeShopsCount} فرع</h3>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl"><Building size={28} className="text-blue-600" /></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <FileSpreadsheet className="text-purple-600" size={22} /> كشف الحسابات المالي للاشتراكات النشطة
                  </h3>
                  <button 
                    onClick={handleRefreshData} 
                    disabled={isRefreshing}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                  >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                    {isRefreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <tr>
                        <th className="p-3">صاحب المحل (العميل)</th>
                        <th className="p-3">عدد الفروع النشطة</th>
                        <th className="p-3">نوع الباقة</th>
                        <th className="p-3">نسبة الخصم المباشر</th>
                        <th className="p-3">الإيراد الصافي (بعد الخصم)</th>
                        <th className="p-3">انتهاء الاشتراك</th>
                        <th className="p-3">الحالة العامة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeClientsList.map((client, idx) => {
                        const firstShop = client.shopsList.find(s => s.status === 'active') || client.shopsList[0] || {};
                        const activeShopsForClient = client.shopsList.filter(s => s.status === 'active').length;
                        const basePrice = firstShop.subscriptionType === 'yearly' ? 5000 : firstShop.subscriptionType === 'lifetime' ? 15000 : firstShop.subscriptionType === 'trial' ? 0 : 500;
                        const disc = client.discountPercent || 0;
                        const finalPrice = (basePrice * (1 - disc / 100)) * activeShopsForClient;

                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3 font-bold text-slate-900">👤 {client.ownerName}</td>
                            <td className="p-3 font-bold text-purple-700">🏢 {activeShopsForClient} فروع</td>
                            <td className="p-3 font-semibold text-blue-600">{firstShop.subscriptionType === 'trial' ? '⏳ تجريبي' : firstShop.subscriptionType}</td>
                            <td className="p-3 font-bold text-emerald-600">{disc > 0 ? `${disc}% خصم` : 'بدون خصم'}</td>
                            <td className="p-3 font-black text-purple-700">{finalPrice} ليرة</td>
                            <td className="p-3 font-mono">{firstShop.subscriptionExpiry || 'غير محدد'}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                نشط
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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

    const filteredWorkerTx = shopTx.filter(t => {
      const matchDate = !selectedDateFilter || t.date === selectedDateFilter;
      const matchPlate = !plateSearchQuery || (t.plate && t.plate.toLowerCase().includes(plateSearchQuery.toLowerCase()));
      return matchDate && matchPlate;
    });

    return (
      <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
        {renderToastComponent()}

        {/* هيدر العامل بتصميم سحابي راقي */}
        <header className="bg-slate-950 border-b border-slate-800 text-white px-6 py-4 shadow-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Car size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base">{currentUser.shopName}</h1>
              <span className="text-xs text-cyan-300 font-medium">شاشة العامل النشطة</span>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition">
            <LogOut size={15} /> تسجيل خروج
          </button>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          {shopAnnouncementsList.length > 0 && (
            <div className="space-y-2">
              {shopAnnouncementsList.map(ann => (
                <div key={ann.id} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-md flex items-start gap-3">
                  <Bell className="mt-0.5 shrink-0 animate-bounce" size={22} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-sm">{ann.title}</h4>
                      <span className="text-[11px] bg-amber-700/50 px-2 py-0.5 rounded-lg">{ann.date}</span>
                    </div>
                    <p className="text-xs text-amber-100 mt-1">{ann.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Car className="text-blue-600" /> {editingTxId ? 'تعديل معلومات المركبة ✏️' : 'تسجيل غسيل جديد'}
                </h3>
                <form onSubmit={handleAddTransaction} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">نوع المركبة *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setVehicleCategory('سيارة')} className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${vehicleCategory === 'سيارة' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                        <Car size={16} /> سيارة
                      </button>
                      <button type="button" onClick={() => setVehicleCategory('موتور')} className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${vehicleCategory === 'موتور' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                        <Bike size={16} /> موتور / دراجة
                      </button>
                    </div>
                  </div>

                  {vehicleCategory === 'سيارة' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">اختر أو ابحث عن موديل السيارة *</label>
                      <input 
                        type="text" 
                        list="carModelsLibrary" 
                        placeholder="ابحث بالماركة أو الموديل..." 
                        value={carModel} 
                        onChange={e => setCarModel(e.target.value)} 
                        className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500" 
                        required 
                      />
                      <datalist id="carModelsLibrary">
                        {comprehensiveCarLibrary.map((car, idx) => (
                          <option key={idx} value={car} />
                        ))}
                      </datalist>
                    </div>
                  )}

                  <input type="text" placeholder="رقم اللوحة *" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} className="w-full px-3 py-2 border rounded-xl uppercase font-bold text-sm text-gray-900" required />
                  
                  <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                    <option>غسيل خارجي فقط</option>
                    <option>غسيل خارجي وداخلي</option>
                    <option>غسيل كامل مع تلميع</option>
                    <option>غسيل موتور</option>
                  </select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="وقت البدء" className="px-3 py-2 border rounded-xl text-sm text-center font-bold text-gray-900" />
                    <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="وقت الانتهاء" className="px-3 py-2 border rounded-xl text-sm text-center font-bold text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">السعر (تحديد يدوي) *</label>
                    <input type="number" placeholder="أدخل السعر (ليرة)" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2.5 border-2 border-blue-400 rounded-xl font-black text-blue-700 text-base outline-none bg-blue-50/50" required />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات (اختياري)</label>
                    <input type="text" placeholder="ملاحظات حول حالة السيارة..." value={txNotes} onChange={e => setTxNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs text-gray-900 bg-white" />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-700">توثيق حالة المركبة بالصور</label>
                    
                    <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-blue-900 block">صورة قبل الغسيل: {beforePhoto ? '✓ تمت الإضافة' : ''}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                          <Camera size={16} /> فتح الكاميرا
                          <input type="file" accept="image/*" capture="environment" onChange={e => handleImageUpload(e, 'before')} className="hidden" />
                        </label>
                        <label className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                          <ImageIcon size={16} /> من الاستوديو
                          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'before')} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-emerald-900 block">صورة بعد الغسيل: {afterPhoto ? '✓ تمت الإضافة' : ''}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                          <Camera size={16} /> فتح الكاميرا
                          <input type="file" accept="image/*" capture="environment" onChange={e => handleImageUpload(e, 'after')} className="hidden" />
                        </label>
                        <label className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                          <ImageIcon size={16} /> من الاستوديو
                          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'after')} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">طريقة الدفع</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => setPayMethod('كاش')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'كاش' ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-800'}`}>كاش 💵</button>
                      <button type="button" onClick={() => setPayMethod('بنك')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'بنك' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>بنك 💳</button>
                      <button type="button" onClick={() => setPayMethod('دين')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'دين' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-800'}`}>دين ⚠️</button>
                    </div>
                  </div>

                  {payMethod === 'دين' && (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-2">
                      <span className="text-xs font-bold text-red-700 block">بيانات الزبون المتدين (ترسل لصاحب المحل):</span>
                      <input type="text" placeholder="اسم الزبون الكامل *" value={debtorName} onChange={e => setDebtorName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-gray-900 font-semibold" required />
                      <input type="text" placeholder="رقم هاتف الزبون *" value={debtorPhone} onChange={e => setDebtorPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-gray-900 font-semibold" required />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md">
                      {editingTxId ? 'تحديث المعلومات ✏️' : 'حفظ الطلب والتحديث 🚀'}
                    </button>
                    {editingTxId && (
                      <button type="button" onClick={() => { setEditingTxId(null); setPlateNumber(''); setCarModel(''); setPrice(''); setTxNotes(''); }} className="px-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-xs">إلغاء</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="text-red-600" size={18} /> تسجيل مصروف لـ {currentUser.shopName}</h3>
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
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-amber-800 flex items-center gap-2">⚠️ قائمة الديون المعلقة (تسديد ديون الزبائن)</h3>
                </div>
                {shopDebts.length === 0 ? (
                  <p className="text-xs text-gray-400">لا توجد ديون معلقة على زبائن هذا الفرع حالياً.</p>
                ) : (
                  <div className="space-y-3">
                    {shopDebts.map(d => (
                      <div key={d.id} className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-sm">
                        <div>
                          <span className="font-bold text-gray-900">👤 الزبون: {d.debtorName} ({d.phone})</span>
                          <p className="text-xs text-gray-600">الخدمة: {d.service} | المبلغ: <strong className="text-red-600">{d.amount} ليرة</strong></p>
                          <span className="text-[10px] text-gray-400">تاريخ الدين: {d.date}</span>
                        </div>

                        {settlingDebtId === d.id ? (
                          <div className="bg-white p-3 rounded-xl border shadow-sm space-y-2 w-full md:w-auto">
                            <span className="text-xs font-bold text-emerald-700 block">اختر طريقة السداد وتاريخه:</span>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setRepayMethod('كاش')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${repayMethod === 'كاش' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>كاش 💵</button>
                              <button type="button" onClick={() => setRepayMethod('بنك')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${repayMethod === 'بنك' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>بنك 💳</button>
                            </div>
                            <input type="date" value={repayDate} onChange={e => setRepayDate(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900" />
                            <input type="text" placeholder="ملاحظات السداد (اختياري)..." value={repayNotes} onChange={e => setRepayNotes(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-xs text-gray-900" />
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => handleSettleDebtAction(shopId, d)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">تأكيد التسديد ✅</button>
                              <button onClick={() => setSettlingDebtId(null)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold">إلغاء</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setSettlingDebtId(d.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs">
                            <CheckSquare size={14} /> تسديد الدين
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-3">
                  <h3 className="font-bold text-gray-800">
                    {selectedDateFilter ? `مركبات تاريخ: ${selectedDateFilter}` : 'سجلات جميع التواريخ القديمة'} 
                    <span className="text-xs text-purple-600 font-semibold mr-2">({filteredWorkerTx.length} نتيجة)</span>
                  </h3>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <input 
                      type="text" 
                      placeholder="بحث برقم اللوحة 🔍" 
                      value={plateSearchQuery} 
                      onChange={e => setPlateSearchQuery(e.target.value)}
                      className="px-3 py-1.5 border rounded-xl text-xs bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <input 
                      type="date" 
                      value={selectedDateFilter} 
                      onChange={e => setSelectedDateFilter(e.target.value)}
                      className="px-3 py-1.5 border rounded-xl text-xs bg-white text-gray-900 font-bold"
                    />
                    
                    <button 
                      onClick={() => setSelectedDateFilter(new Date().toISOString().slice(0, 10))}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      اليوم 📅
                    </button>

                    <button 
                      onClick={() => setSelectedDateFilter('')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      كل السجلات 📂
                    </button>

                    <button 
                      onClick={handleRefreshData} 
                      disabled={isRefreshing}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                    >
                      <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                      {isRefreshing ? 'جاري التحديث...' : 'تحديث'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredWorkerTx.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">لا توجد عمليات مسجلة تطابق بحثك أو التاريخ المختار.</p>
                  ) : (
                    filteredWorkerTx.map(t => (
                      <div key={t.id} className="p-4 bg-gray-50 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold block text-base text-gray-900">🏪 {currentUser.shopName}</span>
                            <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">التاريخ: {t.date || 'غير محدد'}</span>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">[{t.vehicleCategory}] {t.carModel} | لوحة: {t.plate}</span>
                          <p className="text-xs text-gray-600">{t.service} | الطريقة: {t.method === 'دين' ? 'دين ⚠️' : t.method}</p>
                          {t.notes && <p className="text-xs text-amber-700 italic">ملاحظة: {t.notes}</p>}
                          <span className="text-xs font-bold text-emerald-600">المبلغ المدخل: {t.price} ليرة {t.method === 'دين' && '(على الذمة)'}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {t.beforePhoto && <img src={t.beforePhoto} alt="قبل" className="w-12 h-12 object-cover rounded-lg border" />}
                          {t.afterPhoto && <img src={t.afterPhoto} alt="بعد" className="w-12 h-12 object-cover rounded-lg border" />}
                          
                          <button onClick={() => handleStartEditTransaction(t)} className="bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Edit3 size={13} /> تعديل</button>
                          <button onClick={() => setSelectedInvoice({ ...t, shopName: currentUser.shopName, shopInfo: currentUser.shopInfo || { name: currentUser.shopName, address: 'فرع الخدمة', phone: '+90...' } })} className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-black"><Printer size={14} /> طباعة الفاتورة</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ================= لوحة صاحب المحل =================
  const ownedShops = currentUser.ownedShops || [];
  const currentShop = ownedShops.find(s => s.id === Number(selectedShopId)) || ownedShops[0];
  const isAllShops = selectedShopId === 'all';
  const targetShopIds = isAllShops ? ownedShops.map(s => s.id) : [Number(selectedShopId)];

  const calculateDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr || expiryDateStr.includes('مدى الحياة')) return 999;
    const diffTime = new Date(expiryDateStr) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = currentShop ? calculateDaysRemaining(currentShop.subscriptionExpiry) : 999;

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

  const filteredOwnerTx = currentShopTx.filter(t => {
    const matchDate = !selectedDateFilter || t.date === selectedDateFilter;
    const matchPlate = !plateSearchQuery || (t.plate && t.plate.toLowerCase().includes(plateSearchQuery.toLowerCase()));
    return matchDate && matchPlate;
  });

  const shopTotalServices = currentShopTx.reduce((acc, t) => acc + Number(t.price), 0);
  const shopTotalPaid = currentShopTx.reduce((acc, t) => acc + Number(t.paid), 0) + shopRepayList.reduce((acc, r) => acc + Number(r.amount), 0);
  const shopTotalDebtAmount = currentShopDebts.reduce((acc, d) => acc + Number(d.amount), 0);
  const shopTotalExpenses = currentShopExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const shopNetProfit = shopTotalPaid - shopTotalExpenses;

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      {renderToastComponent()}

      {!isAllShops && currentShop && daysLeft <= 3 && daysLeft >= 0 && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2.5 text-center font-black text-xs md:text-sm shadow-md flex items-center justify-center gap-2">
          <AlertTriangle size={18} />
          <span>تحذير هام: سينتهي اشتراك هذا الفرع ({currentShop.name}) خلال {daysLeft} أيام! يرجى التواصل مع الإدارة لتجديد الاشتراك.</span>
        </div>
      )}
      {!isAllShops && currentShop && daysLeft < 0 && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-center font-black text-xs md:text-sm shadow-md flex items-center justify-center gap-2">
          <AlertTriangle size={18} />
          <span>تنبيه: انتهت صلاحية اشتراك هذا الفرع! يرجى التجديد الفوري.</span>
        </div>
      )}

      {/* 🌟 تصميم الهيدر العلوي الجديد والمحدث للمالك (أكثر ترتيباً وتناسقاً) */}
      <header className="bg-slate-950 border-b border-slate-800 text-white px-6 py-4 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Building size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-white text-base tracking-wide">لوحة تحكم المالك: {currentUser.ownerName}</span>
              <span className="text-[10px] bg-slate-800 text-blue-400 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">الرقم الضريبي: {currentUser.taxNumber}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">إدارة المحلات والفروع المتعددة، والديون والأرباح</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select 
              value={selectedShopId || ''} 
              onChange={e => setSelectedShopId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer shadow-inner pr-9"
            >
              {ownedShops.map(s => <option key={s.id} value={s.id}>🏪 {s.name} {s.status === 'suspended' ? '(معلق/منتهي)' : ''}</option>)}
              <option value="all">📊 تقرير الجمع الشامل لجميع فروعي ({ownedShops.length} فرع)</option>
            </select>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition shadow-sm"
          >
            <LogOut size={15} /> تسجيل خروج
          </button>
        </div>
      </header>

      {/* 🌟 شريط التنقل (Tabs) الجديد بتصميم بطاقات الأزرار المنفصلة (Pill Tabs) الأكثر جاذبية */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex gap-3 text-xs md:text-sm font-bold shadow-xs overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          📊 نظرة عامة والجرد
        </button>
        <button 
          onClick={() => setActiveTab('addShop')} 
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'addShop' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          ➕ إدارة وإضافة الفروع
        </button>
        {!isAllShops && (
          <button 
            onClick={() => setActiveTab('accounting')} 
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'accounting' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            📑 كشف الحسابات والديون والأرباح
          </button>
        )}
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          ⚙️ الملف الشخصي والضريبي
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">الفرع النشط حالياً</span>
                <h2 className="text-2xl font-black text-white mt-1">{isAllShops ? `تقرير الجمع الشامل لجميع فروعك (${ownedShops.length} فروع)` : currentShop?.name}</h2>
                <p className="text-xs text-gray-300 mt-1">📍 {isAllShops ? `عدد الفروع النشطة: ${activeShopsCount} من أصل ${ownedShops.length} فرع` : currentShop?.address}</p>
                {currentShop?.status === 'suspended' && (
                  <span className="inline-block mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold">هذا الفرع موقوف / انتهى اشتراكه. يرجى التواصل مع الإدارة للتجديد!</span>
                )}
                
                {/* 🌟 عداد الوقت المتبقي للباقة (أيام وساعات) يظهر لصاحب المحل فقط */}
                {currentShop && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md text-xs font-bold border border-white/15 shadow-inner">
                    <span>⏳ عداد باقتك (الحساب الأساسي):</span>
                    <span className="text-emerald-400 font-mono text-sm">
                      {calculateTimeRemaining(currentShop.subscriptionExpiry)}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-left bg-white/10 p-4 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                <span className="text-xs text-blue-200 block font-bold">صافي الأرباح الكلي</span>
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
                  <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-3">
                    <h3 className="font-bold text-gray-900">
                      {selectedDateFilter ? `حركة مركبات تاريخ: ${selectedDateFilter}` : 'سجلات كافة التواريخ'}
                      <span className="text-xs text-blue-600 font-semibold mr-2">({filteredOwnerTx.length} نتيجة)</span>
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                      <input 
                        type="text" 
                        placeholder="بحث برقم اللوحة 🔍" 
                        value={plateSearchQuery} 
                        onChange={e => setPlateSearchQuery(e.target.value)}
                        className="px-3 py-1.5 border rounded-xl text-xs bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <input 
                        type="date" 
                        value={selectedDateFilter} 
                        onChange={e => setSelectedDateFilter(e.target.value)}
                        className="px-3 py-1.5 border rounded-xl text-xs bg-white text-gray-900 font-bold"
                      />

                      <button 
                        onClick={() => setSelectedDateFilter(new Date().toISOString().slice(0, 10))}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        اليوم 📅
                      </button>

                      <button 
                        onClick={() => setSelectedDateFilter('')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        كل السجلات 📂
                      </button>

                      <button 
                        onClick={handleRefreshData} 
                        disabled={isRefreshing}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                      >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                        {isRefreshing ? 'جاري التحديث...' : 'تحديث'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredOwnerTx.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">لا توجد سيارات مسجلة تطابق البحث أو التاريخ المحدد.</p>
                    ) : (
                      filteredOwnerTx.map(t => (
                        <div key={t.id} className="p-3 bg-gray-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold block text-gray-900">🏪 {currentShop.name}</span>
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">التاريخ: {t.date || 'غير محدد'}</span>
                            </div>
                            <span className="font-bold text-blue-600">[{t.vehicleCategory}] {t.carModel} | لوحة: {t.plate}</span> - {t.service}
                            <span className="block text-xs text-gray-500">المبلغ المسجل: {t.price} ليرة | الحالة: {t.method === 'دين' ? 'دين ⚠️' : t.method} {t.notes && `| ملاحظة: ${t.notes}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDeleteTransactionByOwner(selectedShopId, t.id)} className="bg-red-100 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Trash2 size={13} /> حذف الإدارة</button>
                            <button onClick={() => setSelectedInvoice({ ...t, shopName: currentShop.name, shopInfo: currentShop })} className="bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-black"><Printer size={14} /> طباعة الفاتورة</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'addShop' && (
          <div className="space-y-8 max-w-4xl mx-auto py-2">
            
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-600 p-3.5 rounded-2xl">
                    <Building size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {editingShopId ? 'تعديل بيانات فرع المغسلة ✏️' : 'إضافة فرع جديد لمجموعتك 🏪'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {editingShopId ? 'قم بتحديث معلومات الفرع وعامل الفرع أدناه' : 'تُحدد مدة الصلاحية وعدد الفروع المسموحة بناءً على باقة الحساب الأساسي'}
                    </p>
                  </div>
                </div>
                {editingShopId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingShopId(null); setNewShopName(''); setNewWorkerEmail(''); setNewWorkerPass(''); setNewShopPhone(''); setNewShopAddress(''); }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition"
                  >
                    إلغاء التعديل ✕
                  </button>
                )}
              </div>

              <form onSubmit={handleOwnerSaveShop} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم الفرع الجديد / المغسلة *</label>
                  <input 
                    type="text" 
                    placeholder="مثال: مغسلة النسر - فرع الميناء" 
                    value={newShopName} 
                    onChange={e => setNewShopName(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">البريد الإلكتروني لعامل الفرع (Gmail) *</label>
                    <input 
                      type="email" 
                      placeholder="worker@gmail.com" 
                      value={newWorkerEmail} 
                      onChange={e => setNewWorkerEmail(e.target.value)} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">كلمة سر دخول عامل الفرع *</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={newWorkerPass} 
                      onChange={e => setNewWorkerPass(e.target.value)} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">رقم هاتف الفرع</label>
                    <input 
                      type="text" 
                      placeholder="+90 531 000 0000" 
                      value={newShopPhone} 
                      onChange={e => setNewShopPhone(e.target.value)} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">عنوان الفرع (المنطقة والشارع)</label>
                    <input 
                      type="text" 
                      placeholder="إسكندرون، شارع العصري..." 
                      value={newShopAddress} 
                      onChange={e => setNewShopAddress(e.target.value)} 
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-gray-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition font-semibold" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-2xl font-bold text-sm cursor-pointer shadow-lg transition transform active:scale-95"
                >
                  {editingShopId ? 'حفظ التعديلات وتحديث الفرع ✏️' : 'إضافة الفرع الجديد لفروعي 🚀'}
                </button>
              </form>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-5">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <span>🏢</span> فروعك المسجلة حالياً ({ownedShops.length}):
                </h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
                  إدارة شاملة
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {ownedShops.map(s => (
                  <div key={s.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-base text-slate-900">🏪 {s.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status === 'active' ? 'نشط ✨' : 'موقوف ⚠️'}
                        </span>
                        <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                          الباقة: {s.subscriptionType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <MapPin size={13} className="text-red-500" /> العنوان: {s.address} | <Phone size={13} className="text-blue-500" /> الهاتف: {s.phone}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Mail size={13} className="text-purple-500" /> إيميل العامل: <strong className="text-slate-800 font-mono">{s.workerEmail}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button 
                        onClick={() => handleStartEditShop(s)}
                        className="flex-1 md:flex-initial bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition"
                      >
                        <Edit3 size={14} /> تعديل
                      </button>
                      <button 
                        onClick={() => handleDeleteShopByOwner(s.id)}
                        className="flex-1 md:flex-initial bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition"
                      >
                        <Trash2 size={14} /> حذف
                      </button>
                    </div>
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
            <form onSubmit={e => { e.preventDefault(); showToast('تم تحديث البيانات بنجاح!', 'success'); }} className="space-y-3">
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
                <div className="flex justify-between border-b pb-1"><span className="text-gray-600">طريقة الدفع:</span><span className="font-bold text-gray-900">{selectedInvoice.method === 'دين' ? 'دين (على الذمة)' : selectedInvoice.method}</span></div>
                
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