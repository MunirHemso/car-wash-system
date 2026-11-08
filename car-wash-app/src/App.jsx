import React, { useState, useEffect } from 'react';
import { 
  Car, Shield, Users, Building, Plus, Printer, Camera, Phone, MapPin, Tag, 
  Settings, DollarSign, Mail, AlertTriangle, Trash2, Edit3, Image as ImageIcon, 
  RefreshCw, Bike, Bell, CheckSquare, Award, FileSpreadsheet, UserPlus, Wallet,
  LogOut, CheckCircle, UsersRound, Globe
} from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [lang, setLang] = useState('ar');

  // 🌟 قاموس ترجمة شامل يغطي جميع نصوص الموقع بكافة الصفحات
  const translations = {
    ar: {
      loginTitle: 'نظام إدارة المغاسل السحابي',
      loginSub: 'سجل دخولك عبر النظام السحابي الآمن والفخم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      forgotPass: 'نسيت كلمة المرور؟',
      loginBtn: 'تسجيل الدخول الآمن 🚀',
      secureNotice: 'حماية مشفرة بالكامل عبر بروتوكول السحابة الآمن',
      logout: 'تسجيل خروج',
      dashboard: '📊 نظرة عامة والجرد',
      addShopNav: '➕ إدارة وإضافة الفروع',
      accounting: '📑 كشف الحسابات والديون والأرباح',
      profile: '⚙️ الملف الشخصي والضريبي',
      activeShop: 'الفرع النشط حالياً',
      netProfit: 'صافي الأرباح الكلي',
      cashBox: 'صندوق الكاش 💵',
      bankBox: 'حساب البنك / الشبكة 💳',
      totalDebts: 'إجمالي الديون المعلقة ⚠️',
      totalExpenses: 'إجمالي المصاريف 📉',
      washedCars: 'المركبات المغسولة 🚗',
      newWash: 'تسجيل غسيل جديد',
      vehicleType: 'نوع المركبة',
      car: 'سيارة',
      motor: 'موتور / دراجة',
      carModel: 'موديل السيارة',
      plateNumber: 'رقم اللوحة',
      serviceType: 'نوع الخدمة',
      price: 'السعر (ليرة)',
      notes: 'ملاحظات',
      paymentMethod: 'طريقة الدفع',
      cash: 'كاش 💵',
      bank: 'بنك 💳',
      debt: 'دين ⚠️',
      saveOrder: 'حفظ الطلب والتحديث 🚀',
      dailyVehicles: 'المركبات المسجلة اليوم',
      printInvoice: 'طباعة الفاتورة',
      edit: 'تعديل',
      delete: 'حذف',
      addExpense: 'تسجيل مصروف',
      expenseTitle: 'عنوان المصروف',
      amount: 'المبلغ',
      deductExpense: 'خصم وتسجيل المصروف 📉',
      clientName: 'اسم العميل الكامل',
      phone: 'رقم الهاتف',
      taxNumber: 'الرقم الضريبي',
      save: 'حفظ',
      cancel: 'إلغاء'
    },
    tr: {
      loginTitle: 'Bulut Oto Yıkama Yönetim Sistemi',
      loginSub: 'Güvenli bulut sistemi üzerinden giriş yapın',
      email: 'E-posta Adresi',
      password: 'Şifre',
      forgotPass: 'Şifremi Unuttum?',
      loginBtn: 'Güvenli Giriş 🚀',
      secureNotice: 'Güvenli bulut protokolü ile tamamen şifrelenmiştir',
      logout: 'Çıkış Yap',
      dashboard: '📊 Genel Bakış ve Envanter',
      addShopNav: '➕ Şube Yönetimi ve Ekleme',
      accounting: '📑 Hesap Özeti, Borçlar ve Kâr',
      profile: '⚙️ Profil ve Vergi Bilgileri',
      activeShop: 'Aktif Şube',
      netProfit: 'Toplam Net Kâr',
      cashBox: 'Nakit Kasa 💵',
      bankBox: 'Banka / Kart Hesabı 💳',
      totalDebts: 'Bekleyen Borçlar ⚠️',
      totalExpenses: 'Toplam Giderler 📉',
      washedCars: 'Yıkanan Araçlar 🚗',
      newWash: 'Yeni Yıkama Kaydı',
      vehicleType: 'Araç Türü',
      car: 'Araba',
      motor: 'Motosiklet',
      carModel: 'Araç Modeli',
      plateNumber: 'Plaka Numarası',
      serviceType: 'Hizmet Türü',
      price: 'Fiyat (TL)',
      notes: 'Notlar',
      paymentMethod: 'Ödeme Yöntemi',
      cash: 'Nakit 💵',
      bank: 'Banka 💳',
      debt: 'Veresiye ⚠️',
      saveOrder: 'Siparişi Kaydet 🚀',
      dailyVehicles: 'Bugün Kaydedilen Araçlar',
      printInvoice: 'Fatura Yazdır',
      edit: 'Düzenle',
      delete: 'Sil',
      addExpense: 'Gider Ekle',
      expenseTitle: 'Gider Başlığı',
      amount: 'Tutar',
      deductExpense: 'Gideri Kaydet ve Düş 📉',
      clientName: 'Müşteri Adı Soyadı',
      phone: 'Telefon Numarası',
      taxNumber: 'Vergi Numarası',
      save: 'Kaydet',
      cancel: 'İptal'
    },
    en: {
      loginTitle: 'Cloud Car Wash Management',
      loginSub: 'Sign in through the secure cloud system',
      email: 'Email Address',
      password: 'Password',
      forgotPass: 'Forgot Password?',
      loginBtn: 'Secure Login 🚀',
      secureNotice: 'Fully encrypted via secure cloud protocol',
      logout: 'Logout',
      dashboard: '📊 Overview & Inventory',
      addShopNav: '➕ Branch Management',
      accounting: '📑 Accounts, Debts & Profits',
      profile: '⚙️ Profile & Tax Info',
      activeShop: 'Active Branch',
      netProfit: 'Total Net Profit',
      cashBox: 'Cash Box 💵',
      bankBox: 'Bank / Card Account 💳',
      totalDebts: 'Pending Debts ⚠️',
      totalExpenses: 'Total Expenses 📉',
      washedCars: 'Washed Cars 🚗',
      newWash: 'New Wash Registration',
      vehicleType: 'Vehicle Type',
      car: 'Car',
      motor: 'Motorcycle',
      carModel: 'Car Model',
      plateNumber: 'Plate Number',
      serviceType: 'Service Type',
      price: 'Price (TL)',
      notes: 'Notes',
      paymentMethod: 'Payment Method',
      cash: 'Cash 💵',
      bank: 'Bank 💳',
      debt: 'Debt ⚠️',
      saveOrder: 'Save Order 🚀',
      dailyVehicles: 'Today Registered Vehicles',
      printInvoice: 'Print Invoice',
      edit: 'Edit',
      delete: 'Delete',
      addExpense: 'Add Expense',
      expenseTitle: 'Expense Title',
      amount: 'Amount',
      deductExpense: 'Save & Deduct Expense 📉',
      clientName: 'Full Client Name',
      phone: 'Phone Number',
      taxNumber: 'Tax Number',
      save: 'Save',
      cancel: 'Cancel'
    }
  };

  const t = translations[lang];

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
    { id: 1, name: 'الباقة الشهرية (محل واحد)', type: 'monthly', price: 500, currency: 'ليرة', maxShops: 1 },
    { id: 2, name: 'الباقة السنوية (حتى 5 فروع)', type: 'yearly', price: 5000, currency: 'ليرة', maxShops: 5 },
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
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 10000);
  };

  const validateTurkishPhone = (phone) => {
    if (!phone) return true;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length <= 11 && cleanPhone.length >= 10;
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

    if (newClientPhone && !validateTurkishPhone(newClientPhone)) {
      showToast('رقم الهاتف المدخل غير صحيح! يرجى ألا يتجاوز 11 رقماً.', 'error');
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

    if (editingClientData.phone && !validateTurkishPhone(editingClientData.phone)) {
      showToast('رقم الهاتف غير صالح! الحد الأقصى 11 رقماً.', 'error');
      return;
    }

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

  const handleSuspendClientForMonths = (clientEmail) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من تعليق حساب هذا العميل وجميع فروعه (أرشفة لمدة 3 أشهر)؟',
      onConfirm: async () => {
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
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
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

  const handleRemoveClientSubscription = (clientEmail) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من إلغاء وحذف اشتراك هذا العميل؟ سيتم إيقاف فروعه مؤقتاً.',
      onConfirm: async () => {
        try {
          const clientShops = shops.filter(s => s.ownerEmail.toLowerCase() === clientEmail.toLowerCase());
          for (const shop of clientShops) {
            await updateDoc(doc(db, "platformShops", String(shop.id)), {
              subscriptionType: 'expired',
              subscriptionExpiry: 'منتهي ❌',
              status: 'suspended'
            });
          }
          showToast('تم إلغاء وحذف اشتراك العميل بنجاح.', 'success');
        } catch (e) {
          showToast('حدث خطأ أثناء إلغاء الاشتراك.', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleSuspendShop = (shopId) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من تعليق هذا الفرع وإيقاف اشتراكه؟',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "platformShops", String(shopId)), {
            status: 'suspended',
            suspendedAt: new Date().toISOString()
          });
          showToast('تم تعليق المحل وإيقاف اشتراكه بنجاح.', 'success');
        } catch (e) {
          showToast('حدث خطأ أثناء تعليق الفرع.', 'error');
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
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

  const handleDeleteAnnouncement = (shopId, annId) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذا التنبيه؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "shops", String(shopId), "announcements", String(annId)));
          showToast('تم حذف التنبيه بنجاح.', 'success');
        } catch (error) {}
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
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
            <p>${inv.shopInfo?.address || 'إسكندرون'} | هاتف: <span dir="ltr">${inv.shopInfo?.phone || '+90...'}</span></p>
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

    if (newShopPhone && !validateTurkishPhone(newShopPhone)) {
      showToast('رقم هاتف الفرع غير صحيح! يجب ألا يتجاوز 11 رقماً.', 'error');
      return;
    }

    const ownedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === currentUser.email.toLowerCase());
    
    if (!editingShopId) {
      const firstShop = ownedShops[0];
      const subType = firstShop ? (firstShop.subscriptionType || 'trial') : 'trial';
      
      let maxAllowedShops = 1; 
      if (subType === 'trial') {
        maxAllowedShops = 1; 
      } else {
        const matchedPlan = pricingPlans.find(p => p.type === subType);
        maxAllowedShops = matchedPlan ? matchedPlan.maxShops : 1;
      }

      if (ownedShops.length >= maxAllowedShops) {
        showToast(`عذراً، باقتك الحالية (${subType}) تمنحك حق إنشاء ${maxAllowedShops} فرع كحد أقصى. يرجى ترقية الباقة لدى الإدارة!`, 'error');
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
      
      showToast(editingShopId ? 'تم تحديث بيانات الفرع بنجاح! ✏️✨' : 'تم إضافة الفرع الجديد بنجاح وربطه باشتراكك الأساسي! 🏪✨', 'success');
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

  const handleDeleteShopByOwner = (shopId) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذا الفرع نهائياً من مجموعتك؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "platformShops", String(shopId)));
          const ownerEmail = currentUser.email.toLowerCase();
          const updatedOwnedShops = shops.filter(s => s.ownerEmail && s.ownerEmail.toLowerCase() === ownerEmail && s.id !== Number(shopId));
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
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleDeleteTransactionByOwner = (shopId, txId) => {
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه العملية؟',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "shops", String(shopId), "transactions", String(txId)));
          showToast('تم الحذف بنجاح', 'success');
        } catch (e) {}
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
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

    if (debtorPhone && !validateTurkishPhone(debtorPhone)) {
      showToast('رقم هاتف الزبون المدين غير صحيح! الحد الأقصى 11 رقماً.', 'error');
      return;
    }

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
    setConfirmModal({
      isOpen: true,
      message: 'هل أنت متأكد من حذف هذه الباقة؟',
      onConfirm: () => {
        setPricingPlans(pricingPlans.filter(p => p.id !== planId));
        showToast('تم حذف الباقة بنجاح.', 'success');
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
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

  const renderConfirmModal = () => {
    if (!confirmModal.isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 border border-slate-100 text-right transform transition-all animate-in fade-in zoom-in-95 duration-200" dir="rtl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">تأكيد الإجراء المطلوب</h3>
              <p className="text-xs text-slate-500 mt-0.5">يرجى التأكيد للمتابعة أو إلغاء الطلب</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">{confirmModal.message}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={confirmModal.onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-red-500/25 transition transform active:scale-95"
            >
              تأكيد وحذف / تنفيذ ✅
            </button>
            <button 
              onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
              className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm cursor-pointer transition"
            >
              إلغاء ✕
            </button>
          </div>
        </div>
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
      <div className="min-h-screen bg-slate-100 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {renderToastComponent()}
        {renderConfirmModal()}

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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button onClick={() => setLang('ar')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'ar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>AR</button>
              <button onClick={() => setLang('tr')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'tr' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>TR</button>
              <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>EN</button>
            </div>
            <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition">
              <LogOut size={15} /> {t.logout}
            </button>
          </div>
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
                  <Car className="text-blue-600" /> {editingTxId ? 'تعديل معلومات المركبة ✏️' : t.newWash}
                </h3>
                <form onSubmit={handleAddTransaction} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">{t.vehicleType} *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setVehicleCategory('سيارة')} className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${vehicleCategory === 'سيارة' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                        <Car size={16} /> {t.car}
                      </button>
                      <button type="button" onClick={() => setVehicleCategory('موتور')} className={`py-2.5 text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-center gap-1.5 ${vehicleCategory === 'موتور' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                        <Bike size={16} /> {t.motor}
                      </button>
                    </div>
                  </div>

                  {vehicleCategory === 'سيارة' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{t.carModel} *</label>
                      <input 
                        type="text" 
                        list="carModelsLibrary" 
                        placeholder="ابحث بالماركة أو الموديل..." 
                        value={carModel} 
                        onChange={e => setCarModel(e.target.value)} 
                        onInvalid={e => e.target.setCustomValidity('يرجى تحديد موديل السيارة')}
                        onInput={e => e.target.setCustomValidity('')}
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

                  <input type="text" placeholder={`${t.plateNumber} *`} value={plateNumber} onChange={e => setPlateNumber(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال رقم اللوحة')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl uppercase font-bold text-sm text-gray-900" required />
                  
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.price} *</label>
                    <input type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال السعر المطلوب')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2.5 border-2 border-blue-400 rounded-xl font-black text-blue-700 text-base outline-none bg-blue-50/50" required />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{t.notes}</label>
                    <input type="text" placeholder="ملاحظات حول حالة السيارة..." value={txNotes} onChange={e => setTxNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs text-gray-900 bg-white" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">{t.paymentMethod}</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => setPayMethod('كاش')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'كاش' ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-800'}`}>{t.cash}</button>
                      <button type="button" onClick={() => setPayMethod('بنك')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'بنك' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>{t.bank}</button>
                      <button type="button" onClick={() => setPayMethod('دين')} className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${payMethod === 'دين' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-800'}`}>{t.debt}</button>
                    </div>
                  </div>

                  {payMethod === 'دين' && (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-2">
                      <span className="text-xs font-bold text-red-700 block">بيانات الزبون المدين:</span>
                      <input type="text" placeholder="اسم الزبون الكامل *" value={debtorName} onChange={e => setDebtorName(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال اسم الزبون')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-gray-900 font-semibold" required />
                      <input type="text" dir="ltr" maxLength={11} placeholder="05XXXXXXXXX *" value={debtorPhone} onChange={e => setDebtorPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} onInvalid={e => e.target.setCustomValidity('يرجى إدخال رقم الهاتف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-xs bg-white text-gray-900 font-semibold text-right" required />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md">
                      {editingTxId ? t.edit : t.saveOrder}
                    </button>
                    {editingTxId && (
                      <button type="button" onClick={() => { setEditingTxId(null); setPlateNumber(''); setCarModel(''); setPrice(''); setTxNotes(''); }} className="px-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-xs">{t.cancel}</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="text-red-600" size={18} /> {t.addExpense}</h3>
                <form onSubmit={handleAddExpense} className="space-y-3">
                  <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                    <option>غذاء وضيافة</option><option>مواد تنظيف وصيانة</option><option>فواتير خدمات</option><option>مصاريف أخرى</option>
                  </select>
                  <input type="text" placeholder={t.expenseTitle} value={expTitle} onChange={e => setExpTitle(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال عنوان المصروف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                  <input type="number" placeholder={t.amount} value={expAmount} onChange={e => setExpAmount(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال مبلغ المصروف')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                  <textarea placeholder={t.notes} value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900" />
                  <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold cursor-pointer">{t.deductExpense}</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-3">
                  <h3 className="font-bold text-gray-800">
                    {t.dailyVehicles} 
                    <span className="text-xs text-purple-600 font-semibold mr-2">({filteredWorkerTx.length})</span>
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
                      onClick={handleRefreshData} 
                      disabled={isRefreshing}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border"
                    >
                      <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} /> 
                      {isRefreshing ? '...' : 'تحديث'}
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
                            <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">{t.date || ''}</span>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">[{t.vehicleCategory}] {t.carModel} | لوحة: {t.plate}</span>
                          <p className="text-xs text-gray-600">{t.service} | الطريقة: {t.method === 'دين' ? t.debt : t.method}</p>
                          <span className="text-xs font-bold text-emerald-600">المبلغ المدخل: {t.price} ليرة</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => handleStartEditTransaction(t)} className="bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"><Edit3 size={13} /> {t.edit || 'تعديل'}</button>
                          <button onClick={() => setSelectedInvoice({ ...t, shopName: currentUser.shopName, shopInfo: currentUser.shopInfo || { name: currentUser.shopName, address: 'فرع الخدمة', phone: '+90...' } })} className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 hover:bg-black"><Printer size={14} /> {t.printInvoice || 'طباعة الفاتورة'}</button>
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
    if (!expiryDateStr || expiryDateStr.includes('مدى الحياة')) return 'مدى الحياة ♾️';
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
    <div className="min-h-screen bg-slate-100 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {renderToastComponent()}
      {renderConfirmModal()}

      <header className="bg-slate-950 border-b border-slate-800 text-white px-6 py-4 shadow-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Building size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-extrabold text-white text-base tracking-wide">لوحة تحكم المالك: {currentUser.ownerName}</span>
              <span className="text-[10px] bg-slate-800 text-blue-400 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">الرقم الضريبي: {currentUser.taxNumber}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">إدارة المحلات والفروع المتعددة، والديون والأرباح</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button onClick={() => setLang('ar')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'ar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>AR</button>
            <button onClick={() => setLang('tr')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'tr' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>TR</button>
            <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>EN</button>
          </div>

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
            <LogOut size={15} /> {t.logout}
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex gap-3 text-xs md:text-sm font-bold shadow-xs overflow-x-auto">
        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}>
          {t.dashboard}
        </button>
        <button onClick={() => setActiveTab('addShop')} className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'addShop' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}>
          {t.addShopNav}
        </button>
        {!isAllShops && (
          <button onClick={() => setActiveTab('accounting')} className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'accounting' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.accounting}
          </button>
        )}
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs ${activeTab === 'profile' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'text-slate-600 hover:bg-slate-100'}`}>
          {t.profile}
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">{t.activeShop}</span>
                <h2 className="text-2xl font-black text-white mt-1">{isAllShops ? `تقرير الجمع الشامل لجميع فروعك (${ownedShops.length} فروع)` : currentShop?.name}</h2>
                <p className="text-xs text-gray-300 mt-1">📍 {currentShop?.address}</p>
                
                {currentShop && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md text-xs font-bold border border-white/15 shadow-inner">
                    <span>⏳ عداد باقتك:</span>
                    <span className="text-emerald-400 font-mono text-sm">
                      {calculateTimeRemaining(currentShop.subscriptionExpiry)}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-left bg-white/10 p-4 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                <span className="text-xs text-blue-200 block font-bold">{t.netProfit}</span>
                <span className="text-3xl font-black text-emerald-400">{netProfit} ليرة</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
                <span className="text-gray-500 text-sm">{t.cashBox}</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalCashAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
                <span className="text-gray-500 text-sm">{t.bankBox}</span>
                <h3 className="text-2xl font-black text-blue-600 mt-1">{totalBankAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100">
                <span className="text-gray-500 text-sm">{t.totalDebts}</span>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{totalDebtsAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
                <span className="text-gray-500 text-sm">{t.totalExpenses}</span>
                <h3 className="text-2xl font-black text-red-600 mt-1">{totalExpensesAll} ليرة</h3>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
                <span className="text-gray-500 text-sm">{t.washedCars}</span>
                <h3 className="text-2xl font-black text-purple-600 mt-1">{totalVehiclesAll}</h3>
              </div>
            </div>

            {!isAllShops && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="text-red-600" size={18} /> {t.addExpense}</h3>
                  <form onSubmit={handleAddExpense} className="space-y-3">
                    <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white text-gray-900">
                      <option>غذاء وضيافة</option><option>مواد تنظيف وصيانة</option><option>فواتير خدمات</option><option>مصاريف أخرى</option>
                    </select>
                    <input type="text" placeholder={t.expenseTitle} value={expTitle} onChange={e => setExpTitle(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال العنوان')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <input type="number" placeholder={t.amount} value={expAmount} onChange={e => setExpAmount(e.target.value)} onInvalid={e => e.target.setCustomValidity('يرجى إدخال المبلغ')} onInput={e => e.target.setCustomValidity('')} className="w-full px-3 py-2 border rounded-xl text-sm text-gray-900" required />
                    <textarea placeholder={t.notes} value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm h-16 resize-none text-gray-900" />
                    <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold cursor-pointer">{t.deductExpense}</button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-3">
                    <h3 className="font-bold text-gray-900">سجلات المركبات ({filteredOwnerTx.length})</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input type="text" placeholder="بحث برقم اللوحة 🔍" value={plateSearchQuery} onChange={e => setPlateSearchQuery(e.target.value)} className="px-3 py-1.5 border rounded-xl text-xs bg-white text-gray-900 font-bold outline-none" />
                      <input type="date" value={selectedDateFilter} onChange={e => setSelectedDateFilter(e.target.value)} className="px-3 py-1.5 border rounded-xl text-xs bg-white text-gray-900 font-bold" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredOwnerTx.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">لا توجد بيانات مسجلة.</p>
                    ) : (
                      filteredOwnerTx.map(t => (
                        <div key={t.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center border">
                          <div>
                            <span className="font-bold text-blue-600">[{t.vehicleCategory}] {t.carModel} | لوحة: {t.plate}</span> - {t.service}
                            <span className="block text-xs text-gray-500">المبلغ: {t.price} ليرة</span>
                          </div>
                          <button onClick={() => handleDeleteTransactionByOwner(selectedShopId, t.id)} className="bg-red-100 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-bold">{t.delete || 'حذف'}</button>
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
                  <div className="bg-purple-100 text-purple-600 p-3.5 rounded-2xl"><Building size={26} /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{editingShopId ? 'تعديل فرع' : 'إضافة فرع جديد'}</h3>
                  </div>
                </div>
              </div>

              <form onSubmit={handleOwnerSaveShop} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم الفرع *</label>
                  <input type="text" placeholder="اسم الفرع" value={newShopName} onChange={e => setNewShopName(e.target.value)} className="w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 font-semibold" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">إيميل العامل *</label>
                    <input type="email" placeholder="worker@gmail.com" value={newWorkerEmail} onChange={e => setNewWorkerEmail(e.target.value)} className="w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 font-semibold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">كلمة سر العامل *</label>
                    <input type="password" placeholder="••••••••" value={newWorkerPass} onChange={e => setNewWorkerPass(e.target.value)} className="w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 font-semibold" required />
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg">حفظ الفرع 🚀</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'accounting' && !isAllShops && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-4xl mx-auto space-y-6">
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="text-2xl font-black text-gray-900">🏪 {currentShop?.name}</h2>
              <p className="text-xs text-gray-600">{t.accounting}</p>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border max-w-xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{t.profile}</h3>
          </div>
        )}
      </main>
    </div>
  );
}